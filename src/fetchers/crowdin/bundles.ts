import axios from 'axios';
import { createWriteStream, writeFileSync } from 'fs';
import fs from 'fs/promises';
import { TranslationFile } from './files';
import { TranslationsInfo } from './info';
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
      if (file.exportExtension === 'json') {
        await saveJsonFile(url, file, language);
      } else {
        await saveRegularFile(url, file, language);
      }
    }
  }
}

async function saveRegularFile(
  url: string,
  file: TranslationFile,
  language: TranslationsInfo
) {
  const downloadRequest = await axios.get(url, {
    responseType: 'stream',
  });

  const fileStream = createWriteStream(
    `./translations/${file.path}/${language.localeTag}.${file.exportExtension}`
  );
  downloadRequest.data.pipe(fileStream);
}

async function saveJsonFile(
  url: string,
  file: TranslationFile,
  language: TranslationsInfo
) {
  const data = (await axios.get(url)).data;
  removeEmptyStrings(data);

  writeFileSync(
    `./translations/${file.path}/${language.localeTag}.${file.exportExtension}`,
    JSON.stringify(data, null, 2)
  );
}

function removeEmptyStrings(obj: any) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object') {
      removeEmptyStrings(v);

      if (!Object.keys(v as any).length) {
        delete obj[k];
      }
    } else if (typeof v === 'string' && !v.length) {
      delete obj[k];
    }
  }
}
