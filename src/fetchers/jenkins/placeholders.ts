import axios from 'axios';
import { jenkinsUrl } from './util';

export interface JenkinsPlaceholdersData {
  placeholderExpansions: Record<string, string>;
}

const url = jenkinsUrl + 
  'job/LuckPermsPlaceholders/lastSuccessfulBuild/api/json?tree=url,artifacts[fileName,relativePath]';

export async function fetchData(): Promise<JenkinsPlaceholdersData> {
  const resp = (await axios.get(url)).data;

  const placeholderExpansions: Record<string, string> = {};
  for (const artifact of resp.artifacts) {
    const path = artifact.relativePath;
    const id = path.split('/')[0];
    placeholderExpansions[id] = `${resp.url}artifact/${path}`;
  }

  return { placeholderExpansions };
}
