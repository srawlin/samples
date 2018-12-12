import React, {Component} from "react";
import {Col, Grid} from "react-bootstrap";

import "./Footer.scss";


export default class Footer extends Component {

  render() {
    return (
      <Grid className="Footer">
        <Col xs={10} xsOffset={1}>
          <a>About</a>
          <a>Careers</a>
          <a>FAQ</a>
          <a>Contact</a>
        </Col>
        <Col xs={10} xsOffset={1}>
          &copy; Copyright 2017, Soundboost. All rights reserved.
        </Col>
      </Grid>
    );
  }
}
