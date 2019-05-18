import { GraphQLClient } from 'graphql-request'

const ENDPOINT = 'https://api.github.com/graphql';

const REPO_QUERY = `
query ($owner: String!, $name:String!, $startDate: DateTime!, $after: String) {
  repository(name: $name, owner: $owner) {
    issues(filterBy: {since: $startDate}, orderBy: {field: CREATED_AT, direction: ASC}, first: 50, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
      nodes {
        id
        createdAt
        closedAt
        labels(first: 100) {
          nodes {
            name
          }
        }
      }
    }
  }
}
`;

class GitHub {
  constructor(args) {
    this.name = args.name;
    this.owner = args.owner;
    this.startDate = args.startDate;
  }

  async issuesWithinSprint() {
    const graphQLClient = new GraphQLClient(ENDPOINT, {
      headers: {
        authorization: `Bearer ${process.env.REACT_APP_GITHUB_ACCESS_TOKEN}`,
      },
    })

    let moreToFetch = true,
        after = null,
        issues = [];

    while (moreToFetch) {
      const variables = {
        name: this.name,
        owner: this.owner,
        startDate: this.startDate,
        after,
      };
      const data = await graphQLClient.request(REPO_QUERY, variables);
      const issuesInBatch = data.repository.issues;
      const pageInfo = issuesInBatch.pageInfo;
      issues = issues.concat(issuesInBatch.nodes);
      after = pageInfo.endCursor;
      moreToFetch = !pageInfo.hasNextPage;
    }

    return issues;
  }
}

export default GitHub;
