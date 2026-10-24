import React, { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { MAX_PROMPTS, PROMPT_CATEGORIES } from "../../data/profileOptions";

// Pick up to 3 prompts from the tabs, answer them in place.
export default function PromptPicker({ prompts, onChange }) {
  const [tab, setTab] = useState(PROMPT_CATEGORIES[0].key);
  const active = PROMPT_CATEGORIES.find((c) => c.key === tab) || PROMPT_CATEGORIES[0];
  const full = prompts.length >= MAX_PROMPTS;

  const toggle = (prompt) => {
    if (prompts.some((p) => p.id === prompt.id)) {
      onChange(prompts.filter((p) => p.id !== prompt.id));
    } else if (!full) {
      onChange([...prompts, { id: prompt.id, question: prompt.question, answer: "" }]);
    }
  };

  const setAnswer = (id, answer) => onChange(prompts.map((p) => (p.id === id ? { ...p, answer } : p)));
  const remove = (id) => onChange(prompts.filter((p) => p.id !== id));

  return (
    <div className="prompts">
      <div className="prompts__selected">
        {prompts.length ? (
          prompts.map((p) => (
            <article key={p.id} className="prompt-answer">
              <div className="prompt-answer__head">
                <strong>{p.question}</strong>
                <button type="button" className="icon-btn icon-btn--standard icon-btn--sm" aria-label="Remove prompt" onClick={() => remove(p.id)}>
                  <X size={16} />
                </button>
              </div>
              <textarea
                className="input input--textarea"
                rows={3}
                maxLength={200}
                value={p.answer}
                placeholder="Your answer"
                onChange={(e) => setAnswer(p.id, e.target.value)}
              />
            </article>
          ))
        ) : (
          <p className="prompts__empty">No prompts yet. Choose up to {MAX_PROMPTS} below.</p>
        )}
      </div>

      <div className="prompts__picker">
        <div className="prompts__toolbar">
          <div className="segmented" role="tablist">
            {PROMPT_CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={tab === c.key}
                className={`segmented__btn ${tab === c.key ? "is-active" : ""}`}
                onClick={() => setTab(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <span className="prompts__count">
            {prompts.length}/{MAX_PROMPTS}
          </span>
        </div>

        <ul className="prompts__list">
          {active.prompts.map((prompt) => {
            const selected = prompts.some((p) => p.id === prompt.id);
            return (
              <li key={prompt.id}>
                <button
                  type="button"
                  className={`prompt-option ${selected ? "is-selected" : ""}`}
                  onClick={() => toggle(prompt)}
                  disabled={!selected && full}
                >
                  <span>{prompt.question}</span>
                  {selected ? <Check size={18} /> : <Plus size={18} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
