import constants from "constants";

import React, {Component, PropTypes} from "react";
import {browserHistory} from "react-router";
import {Badge, Col, DropdownButton, Grid, MenuItem} from "react-bootstrap";
import Textarea from "react-textarea-autosize";
import ReactList from "react-list";
import classnames from "classnames";


import moment from "moment";

import api from "api";
import {SongEmbed, SubmissionCard, LoadingIcon} from "components";
import {Submission, User} from "records";
import Auth from "utils/Auth";


import "./OrganizationDashboard.scss";

const TITLES = {
  approved: "Approved",
  declined: "Declined",
  new: "New",
};


export default class OrganizationDashboard extends Component {

  static contextTypes = {
    currentUser: PropTypes.instanceOf(User),
  }

  static propTypes = {
    location: PropTypes.object,
  }

  state = {
    newSubmissionsInProgress: false,
    newSubmissions: {
      count: 0,
      results: [],
    },
    listeningTo: null,
    formInProgress: false,
  }

  componentWillMount = () => {
    const {location} = this.props;

    if (!Auth.isUserAuthenticated()) {
      browserHistory.push("/login");
    }
    this.loadSubmissions(location.query.status);
  }

  componentWillReceiveProps(nextProps) {
    const {location} = this.props;
    if (location.query.status !== nextProps.location.query.status) {
      this.loadSubmissions(nextProps.location.query.status);
    }
  }

  handleStopListening = () => {
    this.setState({listeningTo: null});
  }

  setSubmissions = (submissions) => {
    this.setState({
      newSubmissionsInProgress: false,
      newSubmissions: {
        count: submissions.count,
        next: submissions.next,
        results: submissions.results.map(Submission.fromAPI),
      },
    });
  }

  loadSubmissions = (status) => {
    let queryStatus = "new";
    if (Submission.ALLOWED_STATUSES.indexOf(status) !== -1) {
      queryStatus = status;
    }
    this.setState({newSubmissionsInProgress: true});
    api()
      .get(`submissions/reviewer?status=${queryStatus}&limit=${constants.SUBMISSION_DISPLAY_LIMIT}`)
      .then(({data}) => {
        this.setSubmissions(data);
      })
      .catch(() => {
        this.setState({newSubmissionsInProgress: false});
      });
  }


  listenToSong = (listeningTo) => {
    this.setState({listeningTo});
  }

  loadNextSong = () => {
    const {results} = this.state.newSubmissions;
    this.setState({
      listeningTo: results.length > 0 ? results[0] : null,
      formInProgress: false,
    });
  }

  loadMoreResults = (url) => {
    const {newSubmissions} = this.state;
    const results = newSubmissions.results.slice();
    api().get(url).then(({data}) => {
      Array.prototype.push.apply(results, data.results.map(Submission.fromAPI));
      this.setState({
        newSubmissions: {
          count: data.count,
          next: data.next,
          results,
        },
      });
    });
  }

  getStatusTitle = () => {
    const {location} = this.props;

    return TITLES[location.query.status] || TITLES.new;
  }

  renderNewSubmissionsRows = (index, key) => {
    const {newSubmissions} = this.state;
    const item = newSubmissions.results[index];
    const created = moment(item.createdAt).fromNow();

    const hasMore = newSubmissions.next && newSubmissions.results.length - 1 === index;
    if (hasMore) {
      this.loadMoreResults(newSubmissions.next);
    }
    const submissionClass = classnames("btn submission", {
      "is-paid": item.isPaid,
    });

    return (
      <div key={key}>
        <div className={submissionClass} onClick={() => this.listenToSong(item)}>
          {item.song.title} {created}
        </div>
      </div>
    );
  }

  renderSong = () => {
    const {listeningTo} = this.state;
    return (
      <div>
        <SongEmbed song={listeningTo.song} />
        <Textarea
          className="form-control comment-textarea"
          placeholder="Write a comment here"
          ref={inp => this.commentInput = inp} />
      </div>
    );
  }

  renderContent = () => {
    const {newSubmissions} = this.state;
    if (newSubmissions.count == 0) {
      return (
        <p className="lead">No new submissions!</p>
      );
    }
    return (
      <ReactList
        itemRenderer={this.renderNewSubmissionsRows}
        length={newSubmissions.results.length}
        type="simple" />
    );
  }

  renderDropdownFilter = () => {
    const {location} = this.props;
    const currentStatusFilter = location.query.status || "new";
    const statuses = ["new", "approved", "declined"].filter((status) => status !== currentStatusFilter);
    return (
      <DropdownButton bsSize="small" bsStyle="light" noCaret title={<i className="fa fa-caret-down" />}>
        {statuses.map((status, i) => {
          return (
            <MenuItem
              key={i}
              onSelect={() => browserHistory.push(`/dashboard/?status=${status}`)}>
              {TITLES[status]}
            </MenuItem>
          );
        })}
      </DropdownButton>
    );
  }

  render() {
    const {newSubmissionsInProgress, listeningTo, newSubmissions} = this.state;
    return (
      <Grid className="OrganizationDashboard">
        <SubmissionCard
          loadNextSong={this.loadNextSong}
          onClose={this.handleStopListening}
          setSubmissions={this.setSubmissions}
          submission={listeningTo} />
        <Col xs={10} xsOffset={1}>
          <h2 className="header">
            {this.getStatusTitle()} submissions <Badge>{newSubmissions.count}</Badge>
            {this.renderDropdownFilter()}

          </h2>
          <div className="new-submissions">
            {newSubmissionsInProgress ?
              <div style={{textAlign: "center"}}>
                <LoadingIcon whiteBg={false} />
              </div>: this.renderContent()}
          </div>
        </Col>
      </Grid>
    );
  }
}
