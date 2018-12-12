import React, {Component, PropTypes} from "react";
import {Row, Col, FormControl, Grid} from "react-bootstrap";
import {debounce} from "lodash";
import {scroller, Element} from "react-scroll";

import {LoadingIcon, SongEmbed} from "components";
import {Organization, Song} from "records";
import api from "api";

import SubmissionDetailsForm from "./SubmissionDetailsForm";

import "./OrganizationProfile.scss";


export default class OrganizationProfile extends Component {

  static propTypes = {
    params: PropTypes.object,
  }

  state = {
    submitInProgress: false,
    song: null,
    isLoadingSong: false,
    organization: null,
    songSubmitted: false,
    errors: [],
  }

  componentDidMount() {
    const {slug} = this.props.params;
    api()
      .get(`organizations/${slug}/`)
      .then(({data}) => {
        this.setState({organization: Organization.fromAPI(data)});
      })
      .catch(() => {
        this.setState({submitInProgress: false});
      });
  }

  handleChangeSong = (e) => {
    this.setState({isLoadingSong: true});
    this.validateSongInput(e.target.value);
  }

  handleCancelSong = () => {
    this.setState({song: null});
  }

  validateSongInput = debounce((url) => {
    Song.loadSong(url, (song) => {
      this.setState({song});
      this.setState({isLoadingSong: false});
      scroller.scrollTo("the-song", {
        duration: 500,
        smooth: true,
      });
    }, (err) => {
      console.log(err);
      this.setState({isLoadingSong: false});
    });
  }, 300);

  submitSong = () => {
    this.setState({songSubmitted: true});
  };

  renderSong = (song) => {
    const {slug} = this.props.params;
    return (
      <Element name="the-song">
        <div className="Song">
          <h2>{song.title}</h2>
          <SongEmbed song={song} />
          <SubmissionDetailsForm
            organizationSlug={slug}
            song={song}
            submitSong={this.submitSong} />
        </div>
      </Element>
    );
  }

  renderSongSubmitted = () => {
    return (
      <div style={{textAlign: "center"}}>
        <h1>Thank you!</h1>
        <p className="lead">
          Your song has been submitted, you will receive an email
          once we are done listening to it.
        </p>
      </div>
    );
  }

  render() {
    const {isLoadingSong, song, organization, songSubmitted} = this.state;
    if (!organization) {
      return <LoadingIcon />;
    }
    const {submissionsToday} = organization;
    return (
      <div className="OrganizationProfile">
        <div className="OrganizationHeader">
          <Grid>
            <Col xs={8} xsOffset={2}>
              <Row className="header">
                <Col xs={12}>
                  <h1>{organization.name}</h1>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <FormControl
                    className="song-url-input"
                    onChange={this.handleChangeSong}
                    placeholder="Paste soundcloud or youtube song link here"
                    type="text" />
                  {(isLoadingSong) && <div className="url-input-loading-icon"><LoadingIcon /></div>}
                </Col>
              </Row>
              <Row>
                <div className="statistics-list">
                  <Col md={4}>
                    <span>
                      <i className="fa fa-thumbs-o-up" />&nbsp;
                      {organization.approveRate ?
                        `We approve ${organization.approveRate * 100}% of the songs we receive.` :
                        "We haven't approved any song yet."}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span>
                      <i className="fa fa-clock-o" />&nbsp;
                      {organization.averageResponseTime ?
                        `We respond usually in about ${organization.averageResponseTime}` :
                        "We haven't responded to any song yet."}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span>
                      <i className="fa fa-music" />&nbsp;
                      {submissionsToday === 0 ?
                        "We haven't received any song today yet." :
                        `We have received ${submissionsToday} song${submissionsToday > 1 ? "s" : ""} today.`}
                    </span>
                  </Col>
                </div>
              </Row>
            </Col>
          </Grid>
        </div>
        <Grid className="OrganizationProfile">
          <Col xs={8} xsOffset={2}>
            {!songSubmitted && (song ? this.renderSong(song) : null)}
            {songSubmitted && this.renderSongSubmitted()}
          </Col>
        </Grid>
      </div>
    );
  }
}
