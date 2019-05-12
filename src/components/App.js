import React, { Component } from 'react';
import Repository from './Repository';

class App extends Component {
  render() {
    return <Repository
      repoOwner="ministryofjustice"
      repoName="cloud-platform"
      startDate="2019-05-01T00:00:00Z" // **Updated At** timestamp of the issue - could have been created earlier
    />;
  }
}

export default App;
