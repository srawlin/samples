import React, {Component} from "react";
import {Button, Grid, Col, Row} from "react-bootstrap";
import {browserHistory, Link} from "react-router";
import t from "tcomb-form";

import api from "api";
import Auth from "utils/Auth";
import {Footer, LoadingIcon} from "components";
import {annotateErrors, getValidationErrors, isValidEmail} from "utils";
import {Organization} from "records";

import "./SignupPage.scss";

const Form = t.form.Form;

const SignupSchema = t.struct({
  "first_name": t.String,
  "last_name": t.String,
  "email": t.refinement(t.String, isValidEmail),
  "password": t.String,
});

const OrganizationSignupSchema = t.struct({
  "name": t.String,
  "url": t.String,
});

export default class SignupPage extends Component {

  state = {
    formErrors: {},
    formInProgress: false,
    organizationFormValue: {},
    accountFormValue: {},
    signedUpOrganization: null,
  }

  handleAccountFormChange = (accountFormValue) => {
    this.setState({accountFormValue});
  }

  handleOrganizationFormChange = (organizationFormValue) => {
    this.setState({organizationFormValue});
  }

  handleGoToDashboard = () => {
    browserHistory.push("/dashboard");
  }

  handleSubmitForm = () => {
    const accountValue = this.accountForm.getValue();
    const organizationValue = this.organizationForm.getValue();
    if (!accountValue || !organizationValue) return;
    this.setState({formInProgress: true});
    api()
      .post("organizations/", {
        user: accountValue,
        ...organizationValue,
      })
      .then(({data}) => {
        Auth.authenticateUser(data.jwt_token);
        const organization = Organization.fromAPI(data);
        console.log(organization);
        this.setState({formInProgress: false, signedUpOrganization: Organization.fromAPI(data)});
      })
      .catch((err) => {
        const errors = getValidationErrors(err);
        const newErrors = {
          ...errors.user,
          ...errors,
        };
        newErrors.user = undefined;
        this.setState({formErrors: newErrors});
        this.setState({formInProgress: false});
      });
  }

  formOptions = () => {
    const {formErrors, formInProgress} = this.state;
    return annotateErrors({
      disabled: formInProgress,
      fields: {
        "first_name": {
          error: "Please enter your first name.",
          attrs: {
            placeholder: "e.g., John",
          },
        },
        "last_name": {
          error: "Please enter your last name.",
          attrs: {
            placeholder: "e.g., Doe",
          },
        },
        "email": {
          error: "Please enter a valid email address.,",
          type: "email",
          attrs: {
            placeholder: "e.g., johndoe@cia.gov",
          },
        },
        "password": {
          error: "Please enter a password.",
          type: "password",
          attrs: {
            placeholder: "e.g., ••••••••••••",
          },
        },
        // Organization fields
        "name": {
          error: "Please enter your organization name.",
          attrs: {
            placeholder: "e.g., Youtube",
          },
        },
        "url": {
          error: "Please enter your organization's url.",
          attrs: {
            placeholder: "e.g., youtube.com",
          },
        },
      },
    }, formErrors);
  }

  renderOrganizationLink = () => {
    const {slug} = this.state.signedUpOrganization;
    const link = `https://soundboost.io/${slug}`;
    return <Link to={link}>{link}</Link>;
  }

  renderPostSignup = () => {
    const value = this.accountForm.getValue();
    return (
      <Grid>
        <Row>
          <Col md={6} mdOffset={3}>
            <h1 style={{padding: "30px 0px"}}>Welcome!</h1>
            <p className="lead">
              Thanks for signing up {value.first_name}, your users can start submitting you
              songs via soundboost by going to this link: {this.renderOrganizationLink()}.
            </p>
            <p className="lead">
              Now every time you login you're going to be redirected to
              your dashboard, where you're going to be able to review your
              submissions.
            </p>

            <div style={{textAlign: "center"}}>
              <Button bsStyle="success" onClick={this.handleGoToDashboard}>
                Go to my dashboard
              </Button>
            </div>
          </Col>
        </Row>
      </Grid>
    );
  }

  render() {
    const {accountFormValue, formInProgress, organizationFormValue, signedUpOrganization} = this.state;
    if (signedUpOrganization) {
      return this.renderPostSignup();
    }
    return (
      <Grid className="SignupPage">
        <Col className="signup-form" md={6} mdOffset={3}>
          <h1>Create a soundboost account</h1>
          <Form
            onChange={this.handleAccountFormChange}
            options={this.formOptions()}
            ref={(f) => this.accountForm = f}
            type={SignupSchema}
            value={accountFormValue} />
          <h2>Organization information</h2>
          <Form
            onChange={this.handleOrganizationFormChange}
            options={this.formOptions()}
            ref={(f) => this.organizationForm = f}
            type={OrganizationSignupSchema}
            value={organizationFormValue} />
          <Button
            bsStyle="success"
            disabled={formInProgress}
            onClick={this.handleSubmitForm}
            style={{marginRight: "45px"}}>
            Create account
          </Button>
          {formInProgress && <LoadingIcon />}
        </Col>
        <Footer />
      </Grid>
    );
  }
}
