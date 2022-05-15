import axios from 'axios';

export interface JenkinsLatestBuildData {
  version: string;
  versionTimestamp: string;
  downloads: Record<string, string>;
}

const url =
  'https://ci.lucko.me/job/LuckPerms/lastSuccessfulBuild/api/json?tree=id,timestamp,artifacts[fileName,relativePath]';

export async function fetchData(): Promise<JenkinsLatestBuildData> {
  const resp = (await axios.get(url)).data;

  const version = resp.artifacts[0].fileName.split('-').pop().slice(0, -4);
  const versionTimestamp = resp.timestamp;

  const buildNumber = resp.id;

  const downloads: Record<string, string> = {};
  for (const artifact of resp.artifacts) {
    const { relativePath, fileName } = artifact;

    const platform = relativePath.split('/')[0];
    const hasLoader = relativePath.split('/')[1] === 'loader';

    let url;
    if (hasLoader) {
      url = `https://download.luckperms.net/${buildNumber}/${platform}/${fileName}`;
    } else {
      url = `https://download.luckperms.net/${buildNumber}/${platform}/loader/${fileName}`;
    }

    downloads[platform] = url;
  }

  return { version, versionTimestamp, downloads };
}
