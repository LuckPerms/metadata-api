import axios from 'axios';

export interface JenkinsLatestBuildData {
  version: string;
  versionTimestamp: string;
  downloads: Map<string, string>;
}

const url =
  'https://ci.lucko.me/job/LuckPerms/lastSuccessfulBuild/api/json?tree=url,timestamp,artifacts[fileName,relativePath]';

export async function fetchData(): Promise<JenkinsLatestBuildData> {
  const resp = (await axios.get(url)).data;

  const version = resp.artifacts[0].fileName.split('-').pop().slice(0, -4);
  const versionTimestamp = resp.timestamp;

  const downloads = new Map<string, string>();
  for (const artifact of resp.artifacts) {
    const path = artifact.relativePath;
    const id = path.split('/')[0];
    downloads.set(id, `${resp.url}artifact/${path}`);
  }

  return { version, versionTimestamp, downloads };
}
