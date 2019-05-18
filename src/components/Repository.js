import React, { Component } from 'react';
import GitHub from '../lib/GitHub';

class Repository extends Component {
  state = {
    sprintStart: Date.parse(this.props.startDate),
    sprintEnd: Date.parse(this.props.endDate),
    fetching: true,
    report: {},
  }

  async fetchIssues() {
    const {
      repoOwner,
      repoName,
      startDate,
      endDate
    } = this.props;

    const api = new GitHub({
      owner: repoOwner,
      name: repoName,
      startDate,
      endDate,
    });

    const { report } = await api.issuesWithinSprint();

    this.setState({ fetching: false, report });
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

    const { report } = this.state;

    return (
      <div className="sprintStats">
        <div>Issues opened in sprint: {report.issuesOpenedDuringSprint}</div>
        <div>Issues closed in sprint: {report.issuesClosedDuringSprint}</div>
        <div>Points delivered in sprint: {report.pointsClosedDuringSprint}</div>
      </div>
    );
  }
}

export default Repository;
