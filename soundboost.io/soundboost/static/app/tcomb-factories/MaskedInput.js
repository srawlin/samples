/* eslint react/display-name: 0 */
import React from "react";
import MaskedInput from "react-maskedinput";
import t from "tcomb-form";


export default class MaskedInputFactory extends t.form.Component {

  handleChange(locals, e) {
    locals.onChange(e.target.value);
  }

  getTemplate() {
    return (locals) => {
      let className = "ExpandableTextarea form-group";
      if (locals.hasError) {
        className += " has-error";
      }
      return (
        <div className={className}>
          <label className="control-label">{locals.label}</label>
          <MaskedInput
            className="form-control"
            mask={locals.config.mask}
            onChange={(e) => this.handleChange(locals, e)}
            value={locals.value} />
        </div>
      );
    };
  }
}
