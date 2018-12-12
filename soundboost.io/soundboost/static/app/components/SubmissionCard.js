import constants from "constants";

import React, {Component, PropTypes} from "react";
import {Button, Label, Modal} from "react-bootstrap";
import {findDOMNode} from "react-dom";
import Textarea from "react-textarea-autosize";

import api from "api";
import {LoadingIcon, SongEmbed} from "components";
import {Submission} from "records";

import "./SubmissionCard.scss";


export default class SubmissionCard extends Component {

  static propTypes = {
    loadNextSong: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    setSubmissions: PropTypes.func.isRequired,
    submission: PropTypes.instanceOf(Submission),
  }

  state = {
    errors: [],
    formInProgress: false,
  }

  componentWillReceiveProps() {
    this.setState({errors: []});
  }

  handleRespondSubmission = (submission, status, comment) => {
    const {loadNextSong, setSubmissions} = this.props;
    this.setState({formInProgress: true});
    api()
      .post(`submissions/reviewer/${submission.id}/respond/?limit=${constants.SUBMISSION_DISPLAY_LIMIT}`, {
        status,
        comment,
      })
      .then(({data}) => {
        setSubmissions(data);
        loadNextSong();
        findDOMNode(this.commentInput).value = "";
        this.setState({formInProgress: false});
      })
      .catch((err) => {
        let errors = ["Could not respond submission, please try again later"];
        if (err.response.status === 400) {
          errors = err.response.data.non_field_errors;
        }
        this.setState({
          formInProgress: false,
          errors,
        });
      });
  }

  renderComments = () => {
    const {submission} = this.props;
    const filteredComments = submission.comments.filter(c => c.text);
    if (filteredComments.size === 0) return;
    return (
      <div className="comments">
        <h2>Comments</h2>
        {filteredComments.map((c, i) => {
          return (
            <div className="comment-entry" key={i}>
              <h4>{`${c.createdBy.firstName} ${c.createdBy.lastName}`}</h4>
              <div className="comment-text">
                {c.text}
              </div>
              <small className="comment-timeago">
                {c.createdAt.fromNow()}
              </small>
            </div>
          );
        })}
      </div>
    );
  }

  renderSong = () => {
    const {submission} = this.props;
    const {errors} = this.state;
    return (
      <div>
        <SongEmbed song={submission.song} />
        {this.renderComments()}
        {submission.status === "new" && <Textarea
          className="form-control comment-textarea"
          placeholder="Write a comment here"
          ref={inp => this.commentInput = inp} />}

        {errors.map((e, i) => {
          return <p className="lead error-message" key={i}>{e}</p>;
        })}
      </div>
    );
  }

  renderButtons = () => {
    const {submission} = this.props;
    const {formInProgress} = this.state;
    if (submission && submission.status === "new") {
      return (
        <div>
          <Button
            bsStyle="danger"
            disabled={formInProgress}
            onClick={() => this.handleRespondSubmission(submission, "declined", findDOMNode(this.commentInput).value)}>
            Reject
          </Button>
          <Button
            bsStyle="success"
            disabled={formInProgress}
            onClick={() => this.handleRespondSubmission(submission, "approved", findDOMNode(this.commentInput).value)}>
            Approve
          </Button>
        </div>
      );
    }
  }

  render() {
    const {onClose, submission} = this.props;
    const formInProgress = false;
    return (
      <Modal className="SubmissionCard" show={submission !== null}>
        <Modal.Header closeButton onHide={onClose}>
          <Modal.Title>
            {submission && submission.song.title}
            {submission && submission.isPaid && <Label className="PaidLabel">Paid</Label>}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {formInProgress ? <LoadingIcon /> : submission && this.renderSong()}

        </Modal.Body>

        <Modal.Footer>
          {this.renderButtons()}
        </Modal.Footer>
      </Modal>
    );
  }
}
