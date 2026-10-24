import React from "react";
import { OPENING_LINE_OPTIONS, WRITE_MY_OWN } from "../../data/profileOptions";
import { SelectField, TextAreaField } from "./FormFields";

export default function OpeningLinePicker({ choice, custom, onChoice, onCustom }) {
  return (
    <div className="form-grid">
      <SelectField
        full
        label="Opening line"
        hint="Shown on your card so people have an easy way to start a chat."
        value={choice}
        onChange={(e) => {
          onChoice(e.target.value);
          if (e.target.value !== WRITE_MY_OWN) onCustom("");
        }}
        options={OPENING_LINE_OPTIONS}
        placeholder="Choose a line"
      />
      {choice === WRITE_MY_OWN ? (
        <TextAreaField
          label="Your opening line"
          hint="Something easy to reply to"
          rows={2}
          maxLength={140}
          value={custom}
          onChange={(e) => onCustom(e.target.value)}
          placeholder="Ask me about…"
        />
      ) : null}
    </div>
  );
}
