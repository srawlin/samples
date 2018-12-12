import React, {Component, PropTypes} from "react";
import {browserHistory} from "react-router";
import {DropdownButton, MenuItem, Nav, Navbar} from "react-bootstrap";

import api from "api";
import {User} from "records";
import Auth from "utils/Auth";

import "./Navbar.scss";


export default class SubmitNavbar extends Component {

  static contextTypes = {
    currentUser: PropTypes.instanceOf(User),
  }

  handleLogoutSelected = () => {
    Auth.deauthenticateUser();

    return api()
      .get("logout/")
      .then(() => {
        this.setState({userData: null});
        browserHistory.push("/");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  renderLogout = () => {
    const {currentUser} = this.context;
    return (
      <DropdownButton bsStyle="link" id="nav-dropdown" title={currentUser.firstName}>
        <MenuItem onSelect={this.handleLogoutSelected}>Logout</MenuItem>
      </DropdownButton>
    );
  }

  render() {
    const logo = require("assets/logo.svg");
    const {currentUser} = this.context;
    return (
      <div className="Navbar">
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#"><img src={logo} /></a>
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {currentUser && this.renderLogout()}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}
