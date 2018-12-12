import React, {Component} from "react";
import {browserHistory} from "react-router";
import {Button, Col, Grid} from "react-bootstrap";
import t from "tcomb-form";

import api from "api";
import {LoadingIcon, Footer} from "components";
import Auth from "utils/Auth";

const LoginSchema = t.struct({
  email: t.String,
  password: t.String,
});


const Form = t.form.Form;


export default class LandingPage extends Component {

  state = {
    formInProgress: false,
    formValue: {},
  }

  handleSubmitForm = () => {
    const value = this.form.getValue();
    if (!value) return;
    const {email, password} = value;
    this.setState({formInProgress: true});
    api()
      .post("api-token-auth/", {
        email,
        password,
      })
      .then(({data}) => {
        Auth.authenticateUser(data.token);
        browserHistory.push("/dashboard");
        this.setState({formInProgress: false});
      })
      .catch(() => {
        this.setState({error: "Invalid email or password"});
        this.setState({formInProgress: false});
      });
  }

  formOptions = () => {
    return {
      fields: {
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
      },
    };
  }

  render() {
    const {formInProgress, formValue} = this.state;
    return (
      <Grid className="SignupPage">
        <Col className="signup-form" md={6} mdOffset={3}>
          <h1>Login</h1>
          <Form
            onChange={this.handleAccountFormChange}
            options={this.formOptions()}
            ref={(f) => this.form = f}
            type={LoginSchema}
            value={formValue} />
          <Button
            bsStyle="success"
            disabled={formInProgress}
            onClick={this.handleSubmitForm}
            style={{marginRight: "45px"}}>
            Login
          </Button>
          {formInProgress && <LoadingIcon />}
        </Col>
        <Footer />
      </Grid>
    );
  }
}
