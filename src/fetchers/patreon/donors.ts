import { canAuthenticate, encodePatreonUrl, patreonAuth } from './utils';

import axios from 'axios';

export interface PatreonDonorsData {
  donors: Array<PatreonDonorsInfo>;
}

export interface PatreonDonorsInfo {
  name: string;
  discord: string | null;
  tiers: Array<string>;
}

const startUrl = encodePatreonUrl(
  'https://www.patreon.com/api/oauth2/v2/campaigns/2298876/members?include=user,currently_entitled_tiers&fields[member]=full_name,lifetime_support_cents&fields[user]=social_connections,hide_pledges&fields[tier]=title'
);

export async function fetchData(): Promise<PatreonDonorsData> {
  if (!canAuthenticate()) {
    throw new Error('Auth key not specified');
  }

  let url: string | null = startUrl;
  let donors: Array<PatreonDonorsInfo> = [];

  while (url !== null) {
    url = await fetchDataPage(url, donors);
  }

  return { donors };
}

async function fetchDataPage(
  url: string,
  donors: Array<PatreonDonorsInfo>
): Promise<string | null> {
  const resp = (await axios.get(url, patreonAuth)).data;

  const associatedUsers: Record<string, any> = {};
  const associatedTiers: Record<string, any> = {};

  for (const entity of resp.included) {
    if (entity.type === 'user') {
      let userData: any = {
        id: entity.id,
        hide: entity.attributes.hide_pledges,
      };
      if (entity.attributes.social_connections) {
        userData.discord = entity.attributes.social_connections.discord;
      }
      associatedUsers[entity.id] = userData;
    } else if (entity.type === 'tier') {
      associatedTiers[entity.id] = {
        id: entity.id,
        name: entity.attributes.title,
      };
    }
  }

  for (const patron of resp.data) {
    const username = patron.attributes.full_name.trim();
    const amount = patron.attributes.lifetime_support_cents;

    // exclude anything under $5
    if (amount < 500) {
      continue;
    }

    let userResult: PatreonDonorsInfo = {
      name: username,
      discord: null,
      tiers: [],
    };

    const userId = patron.relationships.user.data.id;
    if (userId in associatedUsers) {
      // respect users choice to make their pledge hidden
      const user = associatedUsers[userId];
      if (user.hide) {
        continue;
      }

      if (user.discord && user.discord.user_id) {
        userResult.discord = user.discord.user_id;
      }
    }

    for (const tierInfo of patron.relationships.currently_entitled_tiers.data) {
      if (tierInfo.id in associatedTiers) {
        userResult.tiers.push(associatedTiers[tierInfo.id].name);
      }
    }

    donors.push(userResult);
  }

  if (resp.links && resp.links.next) {
    return resp.links.next;
  } else {
    return null;
  }
}
