import axios from 'axios';
import { filePlugin, fileWeb, TranslationFile } from './files';
import { canAuthenticate, crowdinAuth } from './utils';

export interface TranslationsData {
  cacheMaxAge: number;
  languages: Record<string, TranslationsInfo>;
}

export interface TranslationsInfo {
  name: string;
  localeTag: string;
  progress: number;
  progressWeb: number;
  contributors: Array<TranslationsContributorInfo>;
}

export interface TranslationsContributorInfo {
  name: string;
  translated: number;
}

const url = 'https://crowdin.com/api/v2/projects/404960';
const urlProgress = (fileId: number) =>
  url + `/files/${fileId}/languages/progress?limit=100`;
const urlContributors = url + '/reports';

export async function fetchData(): Promise<TranslationsData> {
  if (!canAuthenticate()) {
    throw new Error('Auth key not specified');
  }

  const languages = await fetchLanguages();
  await fetchProgressData(languages, filePlugin);
  await fetchProgressData(languages, fileWeb);
  await fetchContributors(languages);

  return {
    languages,
    cacheMaxAge: 604800000, // 7 days (milliseconds)
  };
}

async function fetchLanguages(): Promise<Record<string, TranslationsInfo>> {
  const resp = (await axios.get(url, crowdinAuth)).data;

  const languages: Record<string, TranslationsInfo> = {};
  for (const language of resp.data.targetLanguages) {
    languages[language.id] = {
      name: language.name,
      localeTag: language.locale.replace('-', '_'),
      progress: 0,
      progressWeb: 0,
      contributors: [],
    };
  }

  return languages;
}

async function fetchProgressData(
  languages: Record<string, TranslationsInfo>,
  file: TranslationFile
) {
  const resp = (await axios.get(urlProgress(file.id), crowdinAuth)).data;

  for (const progress of resp.data) {
    const id = progress.data.languageId;
    const percent = progress.data.translationProgress;

    const language = languages[id];
    if (language) {
      file.setProgress(language, percent);
    }
  }
}

async function fetchContributors(languages: Record<string, TranslationsInfo>) {
  const requestId = await fetchContributorsRequest();
  await fetchContributorsWaitForReport(requestId);
  const contributorsReport = await fetchContributorsDownloadReport(requestId);

  for (const user of contributorsReport.data) {
    if (user.translated >= 30) {
      for (const lang of user.languages) {
        const language = languages[lang.id];
        if (language) {
          language.contributors.push({
            name: user.user.username,
            translated: user.translated,
          });
        }
      }
    }
  }
}

async function fetchContributorsRequest(): Promise<string> {
  const body = {
    name: 'top-members',
    schema: {
      unit: 'strings',
      format: 'json',
    },
  };
  const resp = (await axios.post(urlContributors, body, crowdinAuth)).data;
  return resp.data.identifier;
}

async function fetchContributorsWaitForReport(requestId: string) {
  let waiting = true;
  while (waiting) {
    const statusRequest = (
      await axios.get(url + `/reports/${requestId}`, crowdinAuth)
    ).data;
    waiting = statusRequest.data.status !== 'finished';

    if (waiting) {
      // wait a couple of seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function fetchContributorsDownloadReport(requestId: string) {
  const downloadRequest = (
    await axios.get(url + `/reports/${requestId}/download`, crowdinAuth)
  ).data;
  const reportUrl = downloadRequest.data.url;

  return (await axios.get(reportUrl)).data;
}
