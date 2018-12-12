let stripePublishableKey;

if (process.env.LEVEL == "production") {
  stripePublishableKey = "pk_live_l37DtY6UwfhX5J3TSHAY9baO";
} else {
  stripePublishableKey = "pk_test_AKeKnHIbDxzrTZ6jD4jhH2Ho";
}

export default {
  SUBMISSION_DISPLAY_LIMIT: 30,
  STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
};
