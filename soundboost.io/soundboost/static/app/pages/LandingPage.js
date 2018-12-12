import React, {Component} from "react";
import {browserHistory} from "react-router";
import {Button, Col, Grid, Row} from "react-bootstrap";

import {Footer} from "components";

import "./LandingPage.scss";


export default class LandingPage extends Component {

  handleGotoSignup = () => {
    browserHistory.push("/signup");
  }

  renderHeader = () => {
    return (
      <div className="header">
        <img className="logo-img" src={require("assets/logo.svg")} />
        <div className="right-buttons">
          <Button onClick={() => browserHistory.push("/login")} style={{marginRight: "10px"}}>Login</Button>
          <Button bsStyle="success" onClick={this.handleGotoSignup}>Sign up</Button>
        </div>
      </div>
    );
  }

  renderAbout = () => {
    return (
      <Row className="about">
        <Col className="desc-text" md={6} mdOffset={3}>
          <h1>Soundboost lets you organize and monetize your music submission process</h1>
          <Button bsStyle="success" onClick={this.handleGotoSignup} style={{fontSize: "21px", marginTop: "10px"}}>
            Sign up for free
          </Button>
        </Col>
      </Row>
    );
  }

  renderOrganize = () => {
    return (
      <Row className="content-section organize">
        <Col md={4} mdOffset={2}>
          <div className="text-container">
            <h1>Do not miss a song</h1>
            <p className="lead">
              All your submissions are displayed in one place at the order they're submitted.
            </p>
          </div>
        </Col>
        <Col className="img-container" md={4} mdOffset={1}>
          <img src={require("assets/network.svg")} />
        </Col>
      </Row>
    );
  }

  renderSinglePlace = () => {
    return (
      <Row className="content-section single-place">
        <Col md={4} mdOffset={2}>
          <div className="text-container" style={{color: "#4D4D4D"}}>
            <h1 style={{color: "#4D4D4D"}}>Easily submit with a friendly interface</h1>
            <p className="lead">
              Submissions are validated to prevent spam by checking for duplication and that it is a valid song.
            </p>
          </div>
        </Col>
        <Col className="img-container" md={4} mdOffset={1}>
          <img src={require("assets/sent-mail.svg")} />
        </Col>
      </Row>
    );
  }

  renderMonetize = () => {
    return (
      <Row className="content-section monetize">
        <Col className="img-container" md={4} mdOffset={2}>
          <img src={require("assets/successful.png")} />
        </Col>
        <Col md={4} mdOffset={1}>
          <div className="text-container" style={{color: "#4D4D4D"}}>
            <h1 style={{color: "#4D4D4D"}}>Monetize your review process</h1>
            <p className="lead">
              Give artists the opportunity to pay for higher priotity submissions while you make profit of this.
            </p>
          </div>
        </Col>
      </Row>
    );
  }

  renderStartNow = () => {
    return (
      <Row className="start-now-section">
        <Col md={12}>
          <p className="lead">
            Stop wasting time and start receiving submissions with soundboost <strong>for free</strong> right away.
          </p>

          <Button bsStyle="success" onClick={this.handleGotoSignup}>Sign up for free</Button>
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <Grid className="LandingPage" fluid>
        {this.renderHeader()}
        {this.renderAbout()}
        {this.renderSinglePlace()}
        {this.renderMonetize()}
        {this.renderOrganize()}
        {this.renderStartNow()}
        <Footer />
      </Grid>
    );
  }
}
