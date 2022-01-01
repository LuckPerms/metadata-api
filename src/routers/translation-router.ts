import express, { Request, Response } from 'express';
import path from 'path';

import { TranslationManager } from '../data';
import { FileType, files } from '../fetchers/crowdin/files';

export class TranslationRouter {
  translationManager: TranslationManager;
  express = express.Router();

  constructor(translationManager: TranslationManager) {
    this.translationManager = translationManager;
    this.express.get('/:fileType/:localeId', this.handle.bind(this));
    this.express.get('/:localeId', this.handle.bind(this));
  }

  handle(req: Request, res: Response) {
    const localeId = req.params.localeId;
    const rawFileType = req.params.fileType || 'plugin';

    if (!['plugin', 'web'].includes(rawFileType)) {
      res.status(400).send('Invalid type: ' + rawFileType);
      return;
    }

    const fileType = rawFileType as FileType;
    const file = files[fileType];

    const translationsData = this.translationManager.dataManager.translations;
    if (!translationsData) {
      res.status(500).send('Unable to read translations at the moment');
      return;
    }

    const language = translationsData.languages[localeId];
    if (!language) {
      res.status(404).send('No such language');
    } else if (file.getProgress(language) === 0) {
      res
        .status(400)
        .send('No strings have been translated for ' + language.name);
    } else {
      const fileName = language.localeTag + '.' + file.exportExtension;

      res.sendFile(fileName, {
        root: path.resolve(process.cwd(), 'translations', file.path),
        dotfiles: 'deny',
        maxAge: 3600000,
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': file.exportContentType,
        },
      });
    }
  }
}
