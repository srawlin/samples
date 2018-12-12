import React from "react";
import {render} from "react-dom";
import ReactGA from "react-ga";
import {IndexRoute, Router, Route, browserHistory} from "react-router";

import {AppContainer} from "containers";
import {LandingPage, LoginPage, OrganizationProfile, OrganizationDashboard, SignupPage} from "pages";

import "./styles/index.scss";


if (process.env.LEVEL == "production") {
  ReactGA.initialize("UA-88731726-2");
} else {
  ReactGA.initialize("UA-88731726-1");
}

const logPageView = () => {
  ReactGA.set({page: window.location.pathname});
  ReactGA.pageview(window.location.pathname);
};

render(
  <Router
    history={browserHistory}
    onUpdate={logPageView}>
    <Route component={LandingPage} path="/" />
    <Route component={SignupPage} path="/signup" />
    <Route component={LoginPage} path="/login" />
    <Route component={AppContainer} path="/">
      <Route component={OrganizationDashboard} path="dashboard" />
      <Route path=":slug">
        <IndexRoute component={OrganizationProfile} />
      </Route>
    </Route>
  </Router>,
  document.getElementById("app")
);
