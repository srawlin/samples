import * as I from "immutable";

import {Comment, Song} from "records";


const record = I.Record({
  comments: I.List(),
  id: null,
  song: null,
  createdAt: null,
  status: null,
  isPaid: null,
});

record.ALLOWED_STATUSES = ["approved", "declined", "new"];

record.fromAPI = (data) => {
  return new record({
    comments: I.List(data.comments).map((c) => Comment.fromAPI(c)),
    id: data.id,
    song: Song.fromAPI(data.song),
    status: data.status,
    createdAt: data.created_at,
    isPaid: data.is_paid,
  });
};

export default record;
