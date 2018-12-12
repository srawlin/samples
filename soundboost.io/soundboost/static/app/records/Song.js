import * as I from "immutable";
import SC from "soundcloud";
import axios from "axios";

const record = I.Record({
  id: null,
  title: null,
  kind: null,
  url: null,
  identifier: null,
});

record.fromAPI = (data) => {
  return new record(data);
};

record.loadSong = (url, success, fail) => {
  // TODO: Refactor to use promises
  const parser = document.createElement("a");
  parser.href = url;
  if (parser.hostname === "soundcloud.com") {
    SC.oEmbed(url, {"auto_play": true}).then((oEmbed) => {
      success(new record({
        url,
        title: oEmbed.title,
        kind: "soundcloud",
      }));
    });
  } else if (parser.hostname.indexOf("youtube.com") !== -1) {
    let videoId = parser.href.split("v=")[1];
    const ampersandPosition = videoId.indexOf("&");
    if (ampersandPosition != -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
    const url = "https://www.googleapis.com/youtube/v3/videos/" +
                `?part=snippet&id=${videoId}&key=AIzaSyBgxYeEshT5gC1ndp6bz3383L8mb_0PIH8`;
    axios.get(url).then(({data}) => {
      if (data.items.length === 1) {
        return success(new record({
          title: data.items[0].snippet.title,
          identifier: videoId,
          kind: "youtube",
        }));
      }
      return fail("Youtube video invalid");
    });
  }
  return fail("Provider not valid");
};

export default record;
