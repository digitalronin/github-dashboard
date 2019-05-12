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

class Repository extends Component {
  state = {
    fetching: true,
    issues: []
  }

  renderData() {
    if (this.state.fetching) {
      return <div>fetching data...</div>;
    }

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
      const variables = {
        owner: this.props.repoOwner,
        name: this.props.repoName,
        startDate: this.props.startDate,
        after
      };

      const data = await graphQLClient.request(REPO_QUERY, variables);
      const issuesInBatch = data.repository.issues;
      const pageInfo = issuesInBatch.pageInfo;
      issues = issues.concat(issuesInBatch.nodes);
      after = pageInfo.endCursor;
      moreToFetch = !pageInfo.hasNextPage;
    }
    this.setState({ fetching: false, issues });
  }

  componentDidMount() {
    this.fetchIssues();
  }

  render() {
    return (
      <div className='repository'>
        <h1>{this.props.repoOwner}/{this.props.repoName}</h1>
        <h2>
          Issues: {this.state.issues.count}
        </h2>
        {this.renderData()}
      </div>
    );
  }
}

export default Repository;
