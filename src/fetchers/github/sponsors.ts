import { PatreonDonorsData, PatreonDonorsInfo } from '../patreon/donors';

import { githubQuery } from './utils';

export async function fetchData(): Promise<PatreonDonorsData> {
  let donors: Array<PatreonDonorsInfo> = [];

  const resp = await githubQuery(
    `
    query findSponsors($user: String!) {
      user(login: $user) {
        ... on Sponsorable {
          sponsors(first: 100) {
            totalCount
            nodes {
              ... on User {
                login
                sponsorshipForViewerAsSponsorable {
                  tier {
                    name
                    monthlyPriceInCents
                  }
                }
              }
              ... on Organization { login }
            }
          }
        }
      }
    }
  `,
    {
      user: 'lucko',
    }
  );

  const sponsors = (resp as any).user.sponsors.nodes;
  for (const sponsor of sponsors) {
    let tiers: string[] = [];

    const tier = sponsor.sponsorshipForViewerAsSponsorable?.tier;
    if (tier) {
      if (tier.name === '$1 a month') {
        tiers.push('Patron');
      } else if (tier.name === '$5 a month') {
        tiers.push('Donor');
      } else if (tier.name === '$10 a month') {
        tiers.push('Supporter');
      }
    }

    donors.push({
      name: sponsor.login,
      discord: null,
      tiers,
    });
  }

  return { donors };
}
