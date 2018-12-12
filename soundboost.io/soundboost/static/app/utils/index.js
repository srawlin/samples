import React from "react";
import {map} from "lodash";


export const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const isValidEmail = (e) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(e);
};

export const getValidationErrors = ({response}) => {
  if (response) {
    if (response.status === 400) {
      return response.data;
    }
  }
  return {};
};

export const annotateErrors = (options, formErrors) => {
  map(formErrors, (error, field) => {
    if (!error) {
      return;
    }
    if (!options.fields) {
      options.fields = {};
    }
    if (options.fields[field] === undefined) {
      options.fields[field] = {};
    }
    options.fields[field].hasError = true;
    options.fields[field].error = error.map((err, i) => {
      return (<div key={i}>{err}</div>);
    });
  });
  return options;
};


export default {
  getValidationErrors,
  debounce,
  isValidEmail,
};

export {default as Auth} from "./Auth";
