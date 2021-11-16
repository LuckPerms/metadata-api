import axios from 'axios';

export interface JenkinsExpansionsData {
  extensions: Record<ExpansionId, string>;
}

export type ExpansionId =
  | 'extension-legacy-api'
  | 'extension-default-assignments';

export async function fetchData(): Promise<JenkinsExpansionsData> {
  return {
    extensions: {
      'extension-legacy-api': await fetchData0('extension-legacy-api'),
      'extension-default-assignments': await fetchData0(
        'extension-default-assignments'
      ),
    },
  };
}

async function fetchData0(id: string): Promise<string> {
  const url = `https://ci.lucko.me/job/${id}/lastSuccessfulBuild/api/json?tree=url,artifacts[fileName,relativePath]`;
  const resp = (await axios.get(url)).data;

  const artifact = resp.artifacts[0];
  return `${resp.url}artifact/${artifact.relativePath}`;
}
