import React, { Component } from 'react';
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
        state
        title
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

const owner = "ministryofjustice"; // repository owner
const name = "cloud-platform";  // repository name
const startDate = "2019-05-01T00:00:00Z";  // **Updated At** timestamp of the issue - could have been created earlier
// const after = "Y3Vyc29yOnYyOpK5MjAxOS0wNS0wOFQxNTo1NDowMCswMTowMM4aVP_g";  // GraphQL endCursor for paginated results
const after = null;  // GraphQL endCursor for paginated results

const VARIABLES = {
  owner,
  name,
  startDate,
  after
};

class Repository extends Component {
  state = {
    issues: []
  }

  renderIssues() {
    console.log(this.state.issues);
    return (
      <ul>
        {this.state.issues.map(issue => <li key={issue.id}>{issue.title}</li>)}
      </ul>
    );
  }

  async fetchIssues() {
    const graphQLClient = new GraphQLClient(ENDPOINT, {
      headers: {
        authorization: `Bearer ${process.env.REACT_APP_GITHUB_ACCESS_TOKEN}`,
      },
    })

    let moreToFetch = true,
        after = null,
        issues = [];

    while (moreToFetch) {
      const data = await graphQLClient.request(REPO_QUERY, { ...VARIABLES, after });
      const issuesInBatch = data.repository.issues;
      const pageInfo = issuesInBatch.pageInfo;
      issues = issues.concat(issuesInBatch.nodes);
      after = pageInfo.endCursor;
      moreToFetch = !pageInfo.hasNextPage;
    }
    this.setState({ issues });
  }

  componentDidMount() {
    this.fetchIssues();
  }

  render() {
    return (
      <div className='repository'>
        <h1>{owner}/{name}</h1>
        <h2>
          Issues: {this.state.issues.count}
        </h2>
        {this.renderIssues()}
      </div>
    );
  }
}

export default Repository;
