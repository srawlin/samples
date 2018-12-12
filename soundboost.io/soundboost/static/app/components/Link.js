import React, {Component, PropTypes} from "react";
import {Link as ReactRouterLink} from "react-router";


export default class Link extends Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
    to: PropTypes.string.isRequired,
  };

  render() {
    const {to, children} = this.props;
    return (
      <ReactRouterLink {...this.props} to={`/app/${to}`}>
        {children}
      </ReactRouterLink>
    );
  }
}
