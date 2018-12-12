// import Cookies from "js-cookie";
import React, {Component, PropTypes} from "react";
import {Button, Col, DropdownButton, FormControl, FormGroup, MenuItem} from "react-bootstrap";
import FontAwesome from "react-fontawesome";
import {browserHistory} from "react-router";
import api from "api";
import Auth from "utils/Auth";

import "./LoginForm.scss";


export default class LoginForm extends Component {

  static propTypes = {
    params: PropTypes.object,
  }

  state = {
    loginFormInProgress: false,
    userDataInProgess: false,
    menuOpen: false,
    emailValue: "",
    passwordValue: "",
    userData: null,
    loginErrorMessage: null,
    loginCreate: "Login",
  }

  componentDidMount = () => {
    this.getUserData();
  }

  handleOnChangeEamil = (e) => {
    this.setState({emailValue: e.target.value});
  }

  handleOnChangePassword = (e) => {
    this.setState({passwordValue: e.target.value});
  }

  handleSubmitLoginCreate = (e) => {
    e.preventDefault();
    const email = this.state.emailValue;
    const password = this.state.passwordValue;

    if (!email || !password) return;

    if (this.state.loginCreate == "Login") {
      this.loginUser(email, password);
    } else {
      this.createUser(email, password);
    }
  }

  handleInputWasClicked = () => {
    this._inputWasClicked = true;
  }

  handleLogoutSelected = () => {
    Auth.deauthenticateUser();

    return api()
      .get("logout/")
      .then(() => {
        this.setState({userData: null});
        browserHistory.push("/app");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleToggleLoginCreate = () => {
    if (this.state.loginCreate == "Login")
      this.setState({loginCreate: "Create"});
    else
      this.setState({loginCreate: "Login"});
  }

  loginUser = (email, password) => {
    this.setState({loginFormInProgress: true});
    return api()
      .post("api-token-auth/", {
        email,
        password,
      })
      .then((response) => {
        Auth.authenticateUser(response.data.token);
        this.setState({
          loginFormInProgress: false,
          authToken: response.data.token,
        });
        this.getUserData();
      })
      .catch((error) => {
        console.log(error);
        this.setState({loginFormInProgress: false});
        // tell user that email/password failed
        this.setState({loginErrorMessage: "Incorrect email or password."});
      });
  }

  createUser = (email, password) => {
    this.setState({loginFormInProgress: true});
    api()
      .post("users/", {
        email,
        password,
      })
      .then(() => {
        this.setState({
          loginFormInProgress: false,
        });
        this.loginUser(email, password);
      })
      .catch((error) => {
        console.log(error);
        this.setState({loginFormInProgress: false});
        // tell user that email/password failed
        this.setState({loginErrorMessage: "Error. Account already exists."});
      });
  }

  getUserData = () => {
    this.setState({userDataInProgess: true});
    return api()
      .get("users/current/")
      .then((response) => {
        this.setState({userDataInProgess: false});
        this.setState({userData: response.data});
      })
      .catch((error) => {
        console.log(error);
        this.setState({userDataInProgess: false});
        this.setState({userData: null});
      });
  }

  dropdownToggle = (open) => {
    if (this._inputWasClicked) {
      this._inputWasClicked = false;
      return;
    }
    this.setState({menuOpen: open});
  }

  renderLogout() {
    if (!this.state.userData)
      return;

    return (
      <DropdownButton bsStyle="link" id="nav-dropdown" title={this.state.userData.first_name}>
        <MenuItem onSelect={this.handleLogoutSelected}>Logout</MenuItem>
      </DropdownButton>
    );
  }

  render() {
    const loginErrorMessage = this.state.loginErrorMessage ?
      <div className="alert alert-danger fade in">{this.state.loginErrorMessage}</div> :
      null;

    const createAccountButtonLabel = (this.state.loginCreate == "Login") ?
      "Create Account" :
      "Login";

    const loginForm = (
      <DropdownButton
        bsStyle="link"
        id="nav-dropdown"
        onToggle={val => this.dropdownToggle(val)}
        open={this.state.menuOpen}
        title="Login" >
        <Col id="login-dp" md={12} xsOffset={0}>
          <p>Login with</p>
          <div className="social-buttons">
            <a className="btn btn-fb" href="/login/facebook/?next=/"><FontAwesome name="facebook" /> Facebook</a>
            <a className="btn btn-tw" href="/login/twitter/?next=/"><FontAwesome name="twitter" /> Twitter</a>
            <a className="btn btn-sc" href="/login/soundcloud/?next=/"><FontAwesome name="soundcloud" /> Soundcloud</a>
            <a className="btn btn-go" href="/login/google/?next=/"><FontAwesome name="google" /> Google</a>
          </div>
          <MenuItem divider />
          <MenuItem className="default-cursor no-hover">
            <form onSubmit={this.handleSubmitLoginCreate}>
              <FormGroup controlId="formBasicText" onSubmit={this.handleSubmitLoginCreate}>
                <FormControl
                  onChange={this.handleOnChangeEamil}
                  onSelect={this.handleInputWasClicked}
                  placeholder="Email"
                  ref={(input) => this.textInput = input}
                  type="text"
                  value={this.state.emailValue} />
                <FormControl
                  onChange={this.handleOnChangePassword}
                  onSelect={this.handleInputWasClicked}
                  placeholder="Password"
                  ref={(input) => this.textInput = input}
                  type="password"
                  value={this.state.passwordValue} />
                <FormControl.Feedback />
                {loginErrorMessage}
                <Button className="btn btn-primary" onClick={this.handleSubmitLoginCreate} type="submit">
                  {this.state.loginCreate}
                </Button>
              </FormGroup>
            </form>
          </MenuItem>
          <MenuItem>Forgot Password</MenuItem>
          <MenuItem divider />
          <MenuItem onSelect={this.handleToggleLoginCreate}>{createAccountButtonLabel}</MenuItem>
        </Col>
      </DropdownButton>
    );

    return this.state.userData ? this.renderLogout() : loginForm;
  }
}
