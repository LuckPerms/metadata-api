import { DiscordData, fetchData as fetchDiscordData } from './fetchers/discord';
import { JenkinsData, fetchData as fetchJenkinsData } from './fetchers/jenkins';
import { PatreonData, fetchData as fetchPatreonData } from './fetchers/patreon';
import {
  PatreonDonorsData,
  PatreonDonorsInfo,
  fetchData as fetchDonorsData,
} from './fetchers/patreon/donors';
import {
  TranslationsData,
  fetchData as fetchTranslationsData,
} from './fetchers/crowdin/info';
import { downloadBundles } from './fetchers/crowdin/bundles';
import { filePlugin, fileWeb } from './fetchers/crowdin/files';
import { fetchData as fetchSponsorsData } from './fetchers/github/sponsors';

/**
 * Manages data served by the API.
 */
export class DataManager {
  jenkins?: JenkinsData;
  discord?: DiscordData;
  patreon?: PatreonData;
  donors?: PatreonDonorsData;
  translations?: TranslationsData;

  setup: Promise<void>;

  constructor() {
    this.setup = this.refresh().then(() => {
      console.log('Finished initial data fetch');

      setInterval(async () => {
        await this.refreshJenkins();
      }, 30000); // 30 seconds

      setInterval(async () => {
        await this.refreshDiscord();
        await this.refreshPatreon();
        await this.refreshDonors();
      }, 3600000); // 1 hour

      setInterval(async () => {
        await this.refreshTranslations();
      }, 21600000); // 6 hours
    });
  }

  async awaitInitialFetch() {
    await this.setup;
  }

  refresh(): Promise<any> {
    return Promise.all([
      this.refreshJenkins(),
      this.refreshDiscord(),
      this.refreshPatreon(),
      this.refreshDonors(),
      this.refreshTranslations(),
    ]);
  }

  async refreshJenkins() {
    this.jenkins = (await fetch(fetchJenkinsData)) || this.jenkins;
  }

  async refreshDiscord() {
    this.discord = (await fetch(fetchDiscordData)) || this.discord;
  }

  async refreshPatreon() {
    this.patreon = (await fetch(fetchPatreonData)) || this.patreon;
  }

  async refreshDonors() {
    const resp = await Promise.all([
      fetch(fetchDonorsData),
      fetch(fetchSponsorsData),
    ]);

    const newDonors: PatreonDonorsInfo[] = [];

    for (const res of resp) {
      if (res) {
        newDonors.push(...res.donors);
      }
    }

    this.donors = { donors: newDonors };
  }

  async refreshTranslations() {
    this.translations =
      (await fetch(fetchTranslationsData)) || this.translations;
  }
}

async function fetch<T>(func: () => Promise<T>): Promise<T | undefined> {
  try {
    const data = await func();
    return data;
  } catch (err) {
    console.error('Error fetching data', err);
  }
}

/**
 * Manages translation bundles served by the API.
 */
export class TranslationManager {
  dataManager: DataManager;
  setup: Promise<void>;

  constructor(dataManager: DataManager) {
    this.dataManager = dataManager;
    this.setup = this.dataManager
      .awaitInitialFetch()
      .then(() => {
        return this.refresh();
      })
      .then(() => {
        console.log('Finished initial translations export');
        setInterval(async () => {
          await this.refresh();
        }, 21660000); // 6 hours (+ 1 minute, to make sure we are behind the getTranslationData task)
      });
  }

  async refresh() {
    const languages = this.dataManager.translations?.languages;
    if (!languages) {
      return; // can't refresh if we don't have any languages :(
    }

    try {
      await downloadBundles(languages, filePlugin);
      await downloadBundles(languages, fileWeb);
    } catch (err) {
      console.error('Error downloading translations', err);
    }
  }
}
