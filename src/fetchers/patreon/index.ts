import { fetchData as fetchPatreonCount, PatreonCountData } from './count';
import { canAuthenticate } from './utils';

export type PatreonData = PatreonCountData;

export async function fetchData(): Promise<PatreonData> {
  if (!canAuthenticate()) {
    throw new Error('Auth key not specified');
  }

  return {
    ...(await fetchPatreonCount()),
  };
}
