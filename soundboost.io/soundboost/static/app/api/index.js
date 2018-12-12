import axios from "axios";
import Cookies from "js-cookie";
import extend from "lodash/extend";
import Auth from "../utils/Auth";


export default () => {
  const authHeader = Auth.isUserAuthenticated() ?
    {"Authorization": Auth.getJwtAuthString()} :
    null;

  return axios.create({
    baseURL: "/api/",
    headers: extend({"X-CSRFToken": Cookies.get("csrftoken")},
      authHeader),
  });
};
