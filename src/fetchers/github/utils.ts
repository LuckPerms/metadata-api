import { graphql } from '@octokit/graphql';

export function canAuthenticate() {
  return !!process.env.METADATA_API_GITHUB_API_KEY;
}

export const githubQuery = graphql.defaults({
  headers: {
    authorization: `token ${process.env.METADATA_API_GITHUB_API_KEY}`,
  },
});
