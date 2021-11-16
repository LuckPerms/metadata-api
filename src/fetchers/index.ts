import { DiscordData } from './discord';
import { JenkinsData } from './jenkins';
import { PatreonData } from './patreon';

export type CombinedData = JenkinsData & DiscordData & PatreonData;
