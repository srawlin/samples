import React, {Component, PropTypes} from "react";
import {Button} from "react-bootstrap";

import {LoadingIcon} from "components";


export default class SubmitButton extends Component {

  static propTypes = {
    children: PropTypes.node,
    isSubmitting: PropTypes.bool,
  }

  render() {
    const {children, isSubmitting} = this.props;
    return (
      <Button disabled={isSubmitting} type="submit" {...this.props}>
        {isSubmitting ? <LoadingIcon /> : children || "Submit"}
      </Button>
    );
  }
}
