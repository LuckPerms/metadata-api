import { TranslationsInfo } from './info';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { crowdinAuth } from './utils';
import fs from 'fs/promises';

const urlExport =
  'https://crowdin.com/api/v2/projects/404960/translations/exports';

export async function downloadBundles(
  languages: Record<string, TranslationsInfo>
): Promise<void> {
  try {
    await fs.mkdir('./translations');
  } catch (err: any) {
    // ignore
  }

  for (const [languageId, language] of Object.entries(languages)) {
    if (language.progress !== 0) {
      const body = {
        targetLanguageId: languageId,
        fileIds: [2],
        skipUntranslatedStrings: true,
      };
      const request = await axios.post(urlExport, body, crowdinAuth);

      const url = request.data.data.url;
      const downloadRequest = await axios.get(url, {
        responseType: 'stream',
      });

      const fileStream = createWriteStream(
        `./translations/${language.localeTag}.properties`
      );
      downloadRequest.data.pipe(fileStream);
    }
  }
}