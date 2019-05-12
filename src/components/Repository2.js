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

class Repository2 extends Component {
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
    console.log('fetchIssues');

    const graphQLClient = new GraphQLClient(ENDPOINT, {
      headers: {
        authorization: `Bearer ${process.env.REACT_APP_GITHUB_ACCESS_TOKEN}`,
      },
    })

    let keepFetching = true;
    let after = null;
    let vars;
    let data;
    let pageInfo;
    let issues = [];

    while (keepFetching) {
      vars = { ...VARIABLES, after };
      console.log('fetching...');
      data = await graphQLClient.request(REPO_QUERY, vars);
      const issuesInBatch = data.repository.issues;
      pageInfo = issuesInBatch.pageInfo;
      issues = issues.concat(issuesInBatch.nodes);
      if (pageInfo.hasNextPage) {
        after = pageInfo.endCursor;
      } else {
        keepFetching = false;
      }
    }
    this.setState({ issues });
    console.log(data);
  }

  // fetchIssues() {
  //   return (
  //     <Query query={REPO_QUERY} variables={VARIABLES}>
  //       {({ loading, error, data }) => {
  //         if (loading) return "";
  //         if (error) return "";
  //         console.log('fetchIssues', data);
  //         const issues = repository.issues.nodes;
  //         const { repository } = data;
  //         this.setState({ issues: [...this.state.issues, ...issues] });
  //         return "";
  //       }}
  //     </Query>
  //   );
  // }

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

export default Repository2;
