import axios from 'axios';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';

import { TranslationsInfo } from './info';
import { TranslationFile } from './files';
import { canAuthenticate, crowdinAuth } from './utils';

const urlExport =
  'https://crowdin.com/api/v2/projects/404960/translations/exports';

export async function downloadBundles(
  languages: Record<string, TranslationsInfo>,
  file: TranslationFile
): Promise<void> {
  if (!canAuthenticate()) {
    throw new Error('Auth key not specified');
  }

  try {
    await fs.mkdir('./translations');
  } catch (err: any) {
    // ignore
  }

  try {
    await fs.mkdir('./translations/' + file.path);
  } catch (err: any) {
    // ignore
  }

  for (const [languageId, language] of Object.entries(languages)) {
    if (file.getProgress(language) !== 0) {
      const body = {
        targetLanguageId: languageId,
        fileIds: [file.id],
        skipUntranslatedStrings: true,
      };
      const request = await axios.post(urlExport, body, crowdinAuth);

      const url = request.data.data.url;
      const downloadRequest = await axios.get(url, {
        responseType: 'stream',
      });

      const fileStream = createWriteStream(
        `./translations/${file.path}/${language.localeTag}.${file.exportExtension}`
      );
      downloadRequest.data.pipe(fileStream);
    }
  }
}
