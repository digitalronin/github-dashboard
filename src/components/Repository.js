import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const REPO_QUERY = gql`
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
const after = "Y3Vyc29yOnYyOpK5MjAxOS0wNS0wOFQxNTo1NDowMCswMTowMM4aVP_g";  // GraphQL endCursor for paginated results

const VARIABLES = {
  owner,
  name,
  startDate,
  after
};

class Repository extends Component {
  renderIssues(issues) {
    return (
      <ul>
        {issues.map(issue => <li key={issue.id}>{issue.title}</li>)}
      </ul>
    );
  }

  render() {
    return (
      <Query query={REPO_QUERY} variables={VARIABLES}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;
          console.log(data);
          const { repository } = data;
          const issues = repository.issues.nodes;
          return (
            <div className='repository'>
              <h1>
                {owner}/
                {name}
              </h1>
              <h2>
                Issues: {repository.issues.totalCount}
              </h2>
              {this.renderIssues(issues)}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default Repository;
