import {
  fetchData as fetchAdditionalPlugins,
  JenkinsAdditionalPluginsData,
} from './additional-plugins';
import { fetchData as fetchChangeLog, JenkinsChangelogData } from './changelog';
import {
  fetchData as fetchExpansions,
  JenkinsExpansionsData,
} from './extensions';
import { fetchData as fetchLatest, JenkinsLatestBuildData } from './latest';
import {
  fetchData as fetchPlaceholders,
  JenkinsPlaceholdersData,
} from './placeholders';

export type JenkinsData = JenkinsLatestBuildData &
  JenkinsChangelogData &
  JenkinsPlaceholdersData &
  JenkinsExpansionsData &
  JenkinsAdditionalPluginsData;

export async function fetchData(): Promise<JenkinsData> {
  const latest = fetchLatest();
  const changeLog = fetchChangeLog();
  const placeholders = fetchPlaceholders();
  const expansions = fetchExpansions();
  const additionalPlugins = fetchAdditionalPlugins();

  return {
    ...(await latest),
    ...(await changeLog),
    ...(await placeholders),
    ...(await expansions),
    ...(await additionalPlugins),
  };
}
