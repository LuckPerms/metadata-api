import { DataManager } from './data-manager';
import { downloadBundles } from './fetchers/crowdin/bundles';
import { filePlugin, fileWeb } from './fetchers/crowdin/files';

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
