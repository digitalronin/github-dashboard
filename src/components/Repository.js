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
    sprintStart: Date.parse(this.props.startDate),
    sprintEnd: Date.parse(this.props.endDate),
    fetching: true,
    issues: []
  }

  issuesOpenedDuringSprint() {
    return this.state.issues.filter(issue => {
      const createdAt = Date.parse(issue.createdAt);
      return (createdAt > this.state.sprintStart && createdAt < this.state.sprintEnd);
    });
  }

  issuesClosedDuringSprint() {
    return this.state.issues.filter(issue => {
      const closedAt = Date.parse(issue.closedAt);
      return (closedAt > this.state.sprintStart && closedAt < this.state.sprintEnd);
    });
  }

  pointsClosedDuringSprint() {
    return this.issuesClosedDuringSprint().reduce((sum, issue) => {
      console.log('pointsFromLabelNames', this.pointsFromLabelNames(this.labelNames(issue)));
      return sum + this.pointsFromLabelNames(this.labelNames(issue));
    }, 0);
  }

  labelNames(issue) {
    return issue.labels.nodes.map(label => label.name);
  }

  pointsFromLabelNames(names) {
    for(let i = 0; i < names.length; i++) {
      const match = names[i].match(/estimate-(\d+)/);
      if (match) { return parseInt(match[1]) };
    }
    return 0;
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
        {this.renderData()}
      </div>
    );
  }

  renderData() {
    if (this.state.fetching) {
      return <div>fetching data...</div>;
    }

    return (
      <div className="sprintStats">
        <div>Issues opened in sprint: {this.issuesOpenedDuringSprint().length}</div>
        <div>Issues closed in sprint: {this.issuesClosedDuringSprint().length}</div>
        <div>Points delivered in sprint: {this.pointsClosedDuringSprint()}</div>
      </div>
    );
  }


}

export default Repository;
