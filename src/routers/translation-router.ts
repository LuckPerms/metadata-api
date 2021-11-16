import express, { Request, Response } from 'express';

import { TranslationManager } from '../data';
import path from 'path';

export class TranslationRouter {
  translationManager: TranslationManager;
  express = express.Router();

  constructor(translationManager: TranslationManager) {
    this.translationManager = translationManager;
    this.express.get('/:localeId', this.handle);
  }

  handle(req: Request, res: Response) {
    const localeId = req.params.localeId;
    const translationsData = this.translationManager.dataManager.translations;
    if (!translationsData) {
      res.status(500).send('Unable to read translations at the moment');
      return;
    }

    const language = translationsData.languages.get(localeId);
    if (!language) {
      res.status(404).send('No such language');
    } else if (language.progress === 0) {
      res
        .status(400)
        .send('No strings have been translated for ' + language.name);
    } else {
      res.sendFile(`${language.localeTag}.properties`, {
        root: path.resolve(__dirname, '../translations'),
        dotfiles: 'deny',
        maxAge: 3600000,
        headers: {
          'Content-Disposition': `attachment; filename="${language.localeTag}.properties"`,
          'Content-Type': 'text/x-java-properties',
        },
      });
    }
  }
}
