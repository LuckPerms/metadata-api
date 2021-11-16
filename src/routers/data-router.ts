import express, { Request, Response } from 'express';

import { CombinedData } from '../fetchers';
import { DataManager } from '../data';
import { DiscordData } from '../fetchers/discord';
import { JenkinsData } from '../fetchers/jenkins';
import { PatreonData } from '../fetchers/patreon';

export class DataRouter {
  dataManager: DataManager;
  express = express.Router();

  constructor(dataManager: DataManager) {
    this.dataManager = dataManager;
    this.express.get('/all', this.all);
    this.express.get('/version', this.version);
    this.express.get('/changelog', this.changelog);
    this.express.get('/downloads', this.downloads);
    this.express.get('/extensions', this.extensions);
    this.express.get('/additional-plugins', this.additionalPlugins);
    this.express.get('/placeholder-expansions', this.placeholderExpansions);
    this.express.get('/discord-count', this.discordCount);
    this.express.get('/patreon-count', this.patreonCount);
    this.express.get('/translations', this.translations);
    this.express.get('/donors', this.donors);
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

  placeholderExpansions(_: Request, res: Response) {
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
