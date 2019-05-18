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
    this.endDate = args.endDate;
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

    return { report: this.report(issues) };
  }

  report(issues) {
    return {
      issuesOpenedDuringSprint: this.issuesOpenedDuringSprint(issues),
      issuesClosedDuringSprint: this.closedDuringSprint(issues).length,
      pointsClosedDuringSprint: this.pointsClosedDuringSprint(issues),
    }
  }

  issuesOpenedDuringSprint(issues) {
    const sprintStart = Date.parse(this.startDate);
    const sprintEnd = Date.parse(this.endDate);

    return issues.filter(issue => {
      const createdAt = Date.parse(issue.createdAt);
      return (createdAt > sprintStart && createdAt < sprintEnd);
    }).length;
  }

  pointsClosedDuringSprint(issues) {
    return this.closedDuringSprint(issues).reduce((sum, issue) => {
      return sum + this.pointsFromLabelNames(this.labelNames(issue));
    }, 0);
  }

  closedDuringSprint(issues) {
    const sprintStart = Date.parse(this.startDate);
    const sprintEnd = Date.parse(this.endDate);

    return issues.filter(issue => {
      const closedAt = Date.parse(issue.closedAt);
      return (closedAt > sprintStart && closedAt < sprintEnd);
    });
  }

  pointsFromLabelNames(names) {
    for(let i = 0; i < names.length; i++) {
      const match = names[i].match(/estimate-(\d+)/);
      if (match) { return parseInt(match[1]) };
    }
    return 0;
  }

  labelNames(issue) {
    return issue.labels.nodes.map(label => label.name);
  }
}

export default GitHub;
