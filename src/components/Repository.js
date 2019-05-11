import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const REPO_QUERY = gql`
  {
    repository(name: "cloud-platform", owner: "ministryofjustice") {
      hasIssuesEnabled
      owner {
        login
      }
      name
      issues {
        totalCount
      }
    }
  }
`;

class Repository extends Component {
  render() {
    return (
      <Query query={REPO_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;
          const { repository } = data;
          return (
            <div className='repository'>
              <h1>
                {repository.owner.login}/
                {repository.name}
              </h1>
              <h2>
                Issues: {repository.issues.totalCount}
              </h2>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default Repository;
