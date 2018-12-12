import React, {Component, PropTypes} from "react";


export default class LoadingIcon extends Component {

  static propTypes = {
    whiteBg: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    whiteBg: true,
  };

  render() {
    const {whiteBg} = this.props;
    let filename;
    if (whiteBg) {
      filename = "loading-white.svg";
    } else {
      filename = "loading.svg";
    }

    return (
      <span>
        <img
          src={require(`assets/icons/${filename}`)}
          style={{width: "40px", height: "40xp"}} />
      </span>
    );
  }
}
