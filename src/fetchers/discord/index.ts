import {
  DiscordUserCountData,
  fetchData as fetchUserCount,
} from './user-count';

export type DiscordData = DiscordUserCountData;

export async function fetchData(): Promise<DiscordData> {
  return {
    ...(await fetchUserCount()),
  };
}
