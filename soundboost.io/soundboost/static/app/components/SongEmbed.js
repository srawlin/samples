import React, {Component, PropTypes} from "react";
import YouTube from "react-youtube";
import SoundCloud from "react-soundcloud-widget";

import {Song} from "records";


export default class SongEmbed extends Component {

  static propTypes = {
    song: PropTypes.instanceOf(Song).isRequired,
  }

  render() {
    const {song} = this.props;
    if (song.kind === "soundcloud") {
      return <SoundCloud opts={{"auto_play": true}} url={song.url} />;
    } else if (song.kind === "youtube") {
      return (
        <YouTube
          opts={{playerVars: {autoplay: 1}}}
          videoId={song.identifier} />
      );
    }
  }
}
