import { PatreonCountData, fetchData as fetchPatreonCount } from './count';

export type PatreonData = PatreonCountData;

export async function fetchData(): Promise<PatreonData> {
  return {
    ...(await fetchPatreonCount()),
  };
}
