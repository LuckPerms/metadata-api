import {
  JenkinsAdditionalPluginsData,
  fetchData as fetchAdditionalPlugins,
} from './additional-plugins';
import { JenkinsChangelogData, fetchData as fetchChangeLog } from './changelog';
import {
  JenkinsExpansionsData,
  fetchData as fetchExpansions,
} from './extensions';
import { JenkinsLatestBuildData, fetchData as fetchLatest } from './latest';
import {
  JenkinsPlaceholdersData,
  fetchData as fetchPlaceholders,
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
