import axios from 'axios';

export interface JenkinsChangelogData {
  changeLog: Array<JenkinsChangeData>;
}

export interface JenkinsChangeData {
  version: string;
  timestamp: number;
  title: string;
  commit: string;
}

const url =
  'https://ci.lucko.me/job/LuckPerms/api/json?tree=builds[timestamp,result,artifacts[fileName],changeSet[items[msg,commitId]]]';

export async function fetchData(): Promise<JenkinsChangelogData> {
  const resp = (await axios.get(url)).data;

  const changeLog: Array<JenkinsChangeData> = [];
  for (const buildData of resp.builds) {
    if (
      buildData.result === 'SUCCESS' &&
      buildData.changeSet &&
      buildData.changeSet._class === 'hudson.plugins.git.GitChangeSetList'
    ) {
      const changes = buildData.changeSet.items;
      if (changes.length > 0) {
        changeLog.push({
          version: buildData.artifacts[0].fileName
            .split('-')
            .pop()
            .slice(0, -4),
          timestamp: buildData.timestamp,
          title: changes[0].msg,
          commit: changes[0].commitId,
        });
      }
    }
  }

  return { changeLog };
}
