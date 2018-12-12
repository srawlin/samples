import Settings from "constants";

import React, {Component, PropTypes} from "react";
import {Button, Col, Radio, Row} from "react-bootstrap";
import t from "tcomb-form";

import api from "api";
import {LoginToContinue, SubmitButton} from "components";
import {Song} from "records";

import {ExpandableTextarea, MaskedInput} from "tcomb-factories";

const Form = t.form.Form;


const Schema = t.struct({
  comments: t.maybe(t.String),
});

const PaidSchema = t.struct({
  comments: t.maybe(t.String),
  cardNumber: t.String,
  cardCvc: t.String,
  cardExpMonth: t.String,
  cardExpYear: t.String,
});


export default class SubmissionDetailsForm extends Component {

  static propTypes = {
    organizationSlug: PropTypes.string.isRequired,
    song: PropTypes.instanceOf(Song).isRequired,
    submitSong: PropTypes.func.isRequired,
  };

  state = {
    errors: [],
    formValue: {},
    submitInProgress: false,
    paidSubmission: false,
  };

  handleFormChange = (formValue) => {
    this.setState({formValue});
  }

  handleSubmitPremiumSong = () => {
    const value = this.form.getValue();
    if (!value) return;
    this.setState({submitInProgress: true});
    Stripe.setPublishableKey(Settings.STRIPE_PUBLISHABLE_KEY) // eslint-disable-line
    const cardData = {
      number: value.cardNumber,
      cvc: value.cardCvc,
      "exp_month": value.cardExpMonth,
      "exp_year": value.cardExpYear,
    };
    Stripe.createToken(cardData, (status, response) => { // eslint-disable-line
      if (response.error) {
        this.setState({errors: [response.error.message], submitInProgress: false});
      } else {
        this.submitSong(value, response.id);
      }
    });
  }

  handleSubmitSong = () => {
    const value = this.form.getValue();
    if (!value) return;
    this.setState({submitInProgress: true});
    this.submitSong(value);
  }

  submitSong = (value, cardToken) => {
    const {organizationSlug, submitSong} = this.props;
    const {url, title, kind, identifier} = this.props.song;
    const data = {
      url, title, kind, identifier,
      comments: value.comments || undefined,
    };
    if (cardToken) {
      data["card_token"] = cardToken;
    }
    api()
      .post(`organizations/${organizationSlug}/submit/`, data)
      .then(() => {
        this.setState({submitInProgress: false});
        submitSong();
      })
      .catch(({response: {data}}) => {
        const errors = data.non_field_errors || ["Cannot submit song, please try again later"];
        this.setState({submitInProgress: false, errors});
      });
  }

  formLayout = (locals) => {
    const {paidSubmission} = this.state;
    return (
      <div>
        <Row>
          <Col md={6}>{locals.inputs.comments}</Col>
        </Row>
        <p className="lead">
          By paying $1, we guarantee feedback and it will appear on top of the list.
          <br />
          Would you like to upgrade to a paid submission?
          <Radio checked={!paidSubmission} onClick={() => this.setState({paidSubmission: false})}>No</Radio>
          <Radio checked={paidSubmission} onClick={() => this.setState({paidSubmission: true})}>Yes</Radio>
        </p>

        {paidSubmission && <div>
          <Row>
            <Col md={7}>{locals.inputs.cardNumber}</Col>
          </Row>
          <Row>
            <Col md={2}>{locals.inputs.cardCvc}</Col>
            <Col md={2}>{locals.inputs.cardExpMonth}</Col>
            <Col md={2}>{locals.inputs.cardExpYear}</Col>
          </Row>
        </div>}
      </div>
    );
  };

  formOptions = () => {
    return {
      template: this.formLayout,
      fields: {
        comments: {
          label: "Comments",
          factory: ExpandableTextarea,
        },
        cardNumber: {
          label: "Card number (no space or dashes)",
          factory: MaskedInput,
          config: {
            mask: "1111 1111 1111 1111",
          },
          attrs: {
            placeholder: "e.g., 4242424242424242",
          },
        },
        cardCvc: {
          label: "CVC",
          factory: MaskedInput,
          config: {
            mask: "111",
          },
          attrs: {
            placeholder: "e.g., 123",
          },
        },
        cardExpYear: {
          factory: MaskedInput,
          config: {
            mask: "11",
          },
          attrs: {
            placeholder: "YY",
          },
          label: "Exp. Year",
        },
        cardExpMonth: {
          factory: MaskedInput,
          config: {
            mask: "11",
          },
          attrs: {
            placeholder: "MM",
          },
          label: "Exp. Mo",
        },
      },
    };
  }

  renderSubmitErrors = (errors) => {
    return errors.map((err, i) => {
      return (
        <p className="lead error-message" key={i}>
          {err}
        </p>
      );
    });
  }

  render() {
    const {errors, formValue, paidSubmission, submitInProgress} = this.state;
    return (
      <div>
        <LoginToContinue />
        <h1>Submission Details</h1>
        <Form
          onChange={this.handleFormChange}
          options={this.formOptions()}
          ref={(f) => this.form= f}
          type={paidSubmission ? PaidSchema : Schema}
          value={formValue} />
        {errors.length > 0 && this.renderSubmitErrors(errors)}
        <div className="song-buttons">
          <Button bsSize="lg" onClick={this.handleCancelSong}>Cancel</Button>
          <SubmitButton
            bsSize="lg" bsStyle="primary"
            isSubmitting={submitInProgress}
            onClick={paidSubmission ? this.handleSubmitPremiumSong : this.handleSubmitSong}>
            Submit <i aria-hidden className="fa fa-lock" />
          </SubmitButton>
        </div>
      </div>
    );
  }
}
