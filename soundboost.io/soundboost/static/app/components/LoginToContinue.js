import React, {Component, PropTypes} from "react";
import {Button, Modal} from "react-bootstrap";
import t from "tcomb-form";

import api from "api";
import {annotateErrors, getValidationErrors} from "utils";
import Auth from "utils/Auth";
import {User} from "records";

const Form = t.form.Form;

const LoginSchema = t.struct({
  email: t.String,
  password: t.String,
});

const SignupSchema = t.struct({
  "first_name": t.String,
  "last_name": t.String,
  email: t.String,
  password: t.String,
});


export default class LoginToContinue extends Component {

  static contextTypes = {
    setCurrentUser: PropTypes.func.isRequired,
    loadUserData: PropTypes.func.isRequired,
  };

  state = {
    formValue: {},
    formInProgress: false,
  }

  handleFormChange = (formValue) => {
    this.setState({formValue});
  }


  handleSignupSubmit = () => {
    const accountValue = this.form.getValue();
    const {setCurrentUser} = this.context;
    if (!accountValue) return;
    this.setState({formInProgress: true});
    api()
      .post("users/", accountValue)
      .then(({data}) => {
        Auth.authenticateUser(data.jwt_token);
        setCurrentUser(User.fromAPI(data));
        this.setState({formInProgress: false});
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

  handleSubmitForm = () => {
    const value = this.form.getValue();
    if (!value) return;
    const {email, password} = value;
    const {loadUserData} = this.context;
    this.setState({formInProgress: true});
    api()
      .post("api-token-auth/", {
        email,
        password,
      })
      .then((response) => {
        Auth.authenticateUser(response.data.token);
        loadUserData();
        this.setState({formInProgress: false});
      })
      .catch(() => {
        this.setState({
          error: "Incorrect email or password",
          formInProgress: false,
        });
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
      },
    }, formErrors);
  }

  renderToggleLogin = () => {
    const {newAccount} = this.state;
    if (newAccount) {
      return (
        <a onClick={() => this.setState({newAccount: false})}>
          Already have an account.
        </a>
      );
    }
    return (
      <a onClick={() => this.setState({newAccount: true})}>
        Create an account instead
      </a>
    );
  }

  renderSubmitButton = () => {
    const {formInProgress, newAccount} = this.state;
    if (newAccount) {
      return (
        <Button bsStyle="success" disabled={formInProgress} onClick={this.handleSignupSubmit}>
          Create account
        </Button>
      );
    }
    return (
      <Button bsStyle="success" disabled={formInProgress} onClick={this.handleSubmitForm}>
        Login
      </Button>
    );
  }

  render() {
    const {error, formValue, newAccount} = this.state;
    const formSchema = newAccount ? SignupSchema : LoginSchema;
    return (
      <Modal className="LoginToContinue" closeButton show={!Auth.isUserAuthenticated()}>
        <Modal.Header>
          <Modal.Title>Login to continue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onChange={this.handleFormChange}
            options={this.formOptions}
            ref={(f) => this.form = f}
            type={formSchema}
            value={formValue} />

          <div>
            {this.renderToggleLogin()}
          </div>
          {error && <p className="lead error-message">
            {error}
          </p>}
          {this.renderSubmitButton()}
        </Modal.Body>
      </Modal>
    );
  }
}
