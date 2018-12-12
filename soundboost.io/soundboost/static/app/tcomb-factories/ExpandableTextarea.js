/* eslint react/display-name: 0 */

import React from "react";

import Textarea from "react-textarea-autosize";

import t from "tcomb-form";

export default class ExpandableTextarea extends t.form.Component {

  handleChange(locals, e) {
    locals.onChange(e.target.value);
  }

  getTemplate() {
    return (locals) => { // <- locals contains the "recipe" to build the UI

      // handle error status
      let className = "ExpandableTextarea form-group";
      if (locals.hasError) {
        className += " has-error";
      }

      // translate the option model from tcomb to react-select

      return (
        <div className={className}>
          <label className="control-label">{locals.label}</label>
          <Textarea
            className="form-control"
            onChange={(e) => this.handleChange(locals, e)}
            value={locals.value} />
        </div>
      );
    };
  }
}
