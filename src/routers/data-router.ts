import express, { Request, Response } from 'express';
import { DataManager } from '../data-manager';
import { CombinedData } from '../fetchers';
import { DiscordData } from '../fetchers/discord';
import { JenkinsData } from '../fetchers/jenkins';
import { PatreonData } from '../fetchers/patreon';

export class DataRouter {
  dataManager: DataManager;
  express = express.Router();

  constructor(dataManager: DataManager) {
    this.dataManager = dataManager;
    this.express.get('/all', this.all.bind(this));
    this.express.get('/version', this.version.bind(this));
    this.express.get('/changelog', this.changelog.bind(this));
    this.express.get('/downloads', this.downloads.bind(this));
    this.express.get('/extensions', this.extensions.bind(this));
    this.express.get('/additional-plugins', this.additionalPlugins.bind(this));
    this.express.get('/placeholder-expansions', this.placeholders.bind(this));
    this.express.get('/discord-count', this.discordCount.bind(this));
    this.express.get('/patreon-count', this.patreonCount.bind(this));
    this.express.get('/translations', this.translations.bind(this));
    this.express.get('/donors', this.donors.bind(this));
  }

  all(_: Request, res: Response) {
    const data: Partial<CombinedData> = {
      ...this.dataManager.discord,
      ...this.dataManager.jenkins,
      ...this.dataManager.patreon,
    };
    res.send(data);
  }

  version(_: Request, res: Response) {
    const data: Partial<JenkinsData> = {
      version: this.dataManager.jenkins?.version,
      versionTimestamp: this.dataManager.jenkins?.versionTimestamp,
    };
    res.send(data);
  }

  changelog(_: Request, res: Response) {
    const data: Partial<JenkinsData> = {
      changeLog: this.dataManager.jenkins?.changeLog,
    };
    res.send(data);
  }

  downloads(_: Request, res: Response) {
    const data: Partial<JenkinsData> = {
      downloads: this.dataManager.jenkins?.downloads,
    };
    res.send(data);
  }

  extensions(_: Request, res: Response) {
    const data: Partial<JenkinsData> = {
      extensions: this.dataManager.jenkins?.extensions,
    };
    res.send(data);
  }

  additionalPlugins(_: Request, res: Response) {
    const data: Partial<JenkinsData> = {
      additionalPlugins: this.dataManager.jenkins?.additionalPlugins,
    };
    res.send(data);
  }

  placeholders(_: Request, res: Response) {
    const data: Partial<JenkinsData> = {
      placeholderExpansions: this.dataManager.jenkins?.placeholderExpansions,
    };
    res.send(data);
  }

  discordCount(_: Request, res: Response) {
    const data: Partial<DiscordData> = {
      discordUserCount: this.dataManager.discord?.discordUserCount,
    };
    res.send(data);
  }

  patreonCount(_: Request, res: Response) {
    const data: Partial<PatreonData> = {
      patreonCount: this.dataManager.patreon?.patreonCount,
    };
    res.send(data);
  }

  translations(_: Request, res: Response) {
    res.send(this.dataManager.translations);
  }

  donors(_: Request, res: Response) {
    res.send(this.dataManager.donors);
  }
}
