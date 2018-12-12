import * as I from "immutable";


const record = I.Record({
  id: null,
  firstName: null,
  lastName: null,
  email: null,
});

record.fromAPI = (data) => {
  return new record({
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
  });
};

export default record;
