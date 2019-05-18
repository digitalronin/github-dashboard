import React, { Component } from 'react';
import GitHub from '../lib/GitHub';

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
    const {
      repoOwner,
      repoName,
      startDate
    } = this.props;

    const api = new GitHub({
      owner: repoOwner,
      name: repoName,
      startDate
    });

    const issues = await api.issuesWithinSprint();

    this.setState({ fetching: false, issues });
  }

  componentDidMount() {
    this.fetchIssues();
  }

  render() {
    const startDate = (new Date(this.state.sprintStart)).toDateString()
    const endDate = (new Date(this.state.sprintEnd)).toDateString()

    return (
      <div className='repository'>
        <h1>{this.props.repoOwner}/{this.props.repoName}</h1>
        <h2>{startDate} - {endDate}</h2>
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
