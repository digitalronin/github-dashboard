import React, { Component } from 'react';
import Repository from './Repository';

class App extends Component {
  render() {
    return <Repository
      repoOwner="ministryofjustice"
      repoName="cloud-platform"
      startDate="2019-04-29T00:00:00Z" // **Updated At** timestamp of the issue - could have been created earlier
      endDate="2019-05-10T22:00:00Z" // **Updated At** timestamp of the issue - could have been created earlier
    />;
  }
}

export default App;
