import axios from 'axios';
import { encodePatreonUrl, patreonAuth } from './utils';

export interface PatreonCountData {
  patreonCount: number;
}

const url = encodePatreonUrl(
  'https://www.patreon.com/api/oauth2/v2/campaigns/2298876?fields[campaign]=patron_count'
);

export async function fetchData(): Promise<PatreonCountData> {
  const resp = (await axios.get(url, patreonAuth)).data;
  const patreonCount = resp.data.attributes.patron_count;
  return { patreonCount };
}
