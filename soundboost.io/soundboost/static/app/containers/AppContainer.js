import React, {Component, PropTypes} from "react";
import Alert from "react-s-alert";
import {Footer, SubmitNavbar} from "components";

import api from "api";
import {User} from "records";
import Auth from "utils/Auth";

import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";


export default class AppContainer extends Component {

  static propTypes = {
    children: PropTypes.node,
    hideNav: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    hideNav: false,
  };

  static childContextTypes = {
    params: PropTypes.object,
    currentUser: PropTypes.instanceOf(User),
    setCurrentUser: PropTypes.func,
    loadUserData: PropTypes.func,
  };

  static propTypes = {
    params: PropTypes.object,
  };

  state = {
    currentUser: null,
  }

  getChildContext() {
    const {currentUser} = this.state;
    return {
      currentUser,
      params: this.props.params,
      setCurrentUser: this.setCurrentUser,
      loadUserData: this.loadUserData,
    };
  }

  componentWillMount() {
    if (Auth.isUserAuthenticated()) {
      this.loadUserData();
    }
  }

  setCurrentUser = (currentUser) => {
    this.setState({currentUser});
  }

  loadUserData = () => {
    this.setState({userDataInProgess: true});
    return api()
      .get("users/current/")
      .then(({data}) => {
        this.setCurrentUser(User.fromAPI(data));
      });
  }

  render() {
    return (
      <div className="submit-container">
        <SubmitNavbar />
        {this.props.children}
        <Footer />
        <Alert stack={{limit: 3}} />
      </div>
    );
  }
}
