import * as I from "immutable";
import moment from "moment";

import {User} from "records";


const record = I.Record({
  createdBy: null,
  text: null,
  createdAt: null,
});

record.fromAPI = (data) => {
  return new record({
    createdAt: moment(data.created_at),
    text: data.text,
    createdBy: User.fromAPI(data.created_by),
  });
};


export default record;
