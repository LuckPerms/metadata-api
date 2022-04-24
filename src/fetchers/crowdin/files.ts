import { TranslationsInfo } from './info';

export interface TranslationFile {
  id: number;
  path: string;
  getProgress: (language: TranslationsInfo) => number;
  setProgress: (language: TranslationsInfo, progress: number) => void;
  exportExtension: string;
  exportContentType: string;
}

export const filePlugin: TranslationFile = {
  id: 2,
  path: 'plugin',
  getProgress: language => language.progress,
  setProgress: (language, progress) => {
    language.progress = progress;
  },
  exportExtension: 'properties',
  exportContentType: 'text/x-java-properties',
};

export const fileWeb: TranslationFile = {
  id: 9,
  path: 'web',
  getProgress: language => language.progressWeb,
  setProgress: (language, progress) => {
    language.progressWeb = progress;
  },
  exportExtension: 'json',
  exportContentType: 'application/json',
};

export type FileType = 'plugin' | 'web';

export const files: Record<FileType, TranslationFile> = {
  plugin: filePlugin,
  web: fileWeb,
};
