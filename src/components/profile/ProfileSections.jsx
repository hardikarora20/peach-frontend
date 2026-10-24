import React from "react";
import { Coffee, Heart, Image as ImageIcon, MessageCircle, Shield, Sparkles, Star, User } from "lucide-react";
import CityPicker from "../CityPicker";
import { ChipGroup, Field, FormSection, PhotoGrid, SelectField, TextAreaField, TextField } from "./FormFields";
import PromptPicker from "./PromptPicker";
import OpeningLinePicker from "./OpeningLinePicker";
import {
  COMMUNICATION_OPTIONS, CONFLICT_OPTIONS, CONNECTION_OPTIONS, CORE_VALUE_OPTIONS, DATING_INTENT_OPTIONS,
  DEALBREAKER_OPTIONS, DRINK_OPTIONS, FOOD_OPTIONS, GENDER_OPTIONS, INTEREST_OPTIONS, LONG_DISTANCE_OPTIONS,
  LOVE_LANGUAGE_OPTIONS, PERSONALITY_OPTIONS, SLEEP_OPTIONS, SMOKE_OPTIONS,
} from "../../data/profileOptions";

// Each section takes the object returned by useProfileForm(), so Onboarding and Edit render identical fields.

export function BasicsSection({ pf, showErrors = false, span = 12 }) {
  const { form, setField } = pf;
  const err = (cond, msg) => (showErrors && cond ? msg : "");
  const ageNum = Number(form.age);
  return (
    <FormSection id="basics" span={span} title="Basics" description="Your name, age and city appear on your card." icon={<User size={18} />}>
      <div className="form-grid">
        <TextField
          required
          label="First name"
          autoComplete="given-name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Your first name"
          maxLength={40}
          error={err(!form.name.trim(), "Add your name")}
        />
        <TextField
          required
          label="Age"
          type="number"
          inputMode="numeric"
          min="18"
          max="99"
          value={form.age}
          onChange={(e) => setField("age", e.target.value)}
          placeholder="18+"
          error={err(!form.age || ageNum < 18, "You need to be 18 or older")}
        />
        <SelectField
          required
          label="Gender"
          value={form.gender}
          onChange={(e) => setField("gender", e.target.value)}
          options={GENDER_OPTIONS}
          error={err(!form.gender, "Choose an option")}
        />
        {/* Edit page used a free-text input here; both pages now use the same city picker */}
        <Field label="City" required error={err(!form.location, "Choose your city")}>
          <CityPicker value={form.location} onSelect={(city) => setField("location", city)} invalid={showErrors && !form.location} />
        </Field>
        <TextAreaField
          required
          label="Bio"
          rows={4}
          maxLength={300}
          value={form.bio}
          onChange={(e) => setField("bio", e.target.value)}
          placeholder="A few lines about you – what you do, what you enjoy, what you're looking for."
          error={err(!form.bio.trim(), "Write a short bio")}
        />
      </div>
    </FormSection>
  );
}

export function PhotosSection({ pf, span = 12 }) {
  return (
    <FormSection
      id="photos"
      span={span}
      title="Photos"
      description={`Add up to 6 image links. The first one is your main photo · ${pf.completion.filledImages}/6 added`}
      icon={<ImageIcon size={18} />}
    >
      <PhotoGrid images={pf.form.images} onChange={pf.setImage} />
    </FormSection>
  );
}

export function RelationshipSection({ pf, span = 12 }) {
  const { form, setField } = pf;
  return (
    <FormSection id="relationship" span={span} title="What you're looking for" description="Helps people know if you want the same thing." icon={<Heart size={18} />}>
      <div className="form-grid">
        <SelectField label="Looking for" value={form.datingIntent} onChange={(e) => setField("datingIntent", e.target.value)} options={DATING_INTENT_OPTIONS} />
        <SelectField label="Connection" value={form.connectionPreference} onChange={(e) => setField("connectionPreference", e.target.value)} options={CONNECTION_OPTIONS} />
        <SelectField label="Open to long distance" value={form.openToLongDistance} onChange={(e) => setField("openToLongDistance", e.target.value)} options={LONG_DISTANCE_OPTIONS} />
        <SelectField label="Texting style" value={form.communicationStyle} onChange={(e) => setField("communicationStyle", e.target.value)} options={COMMUNICATION_OPTIONS} />
        <SelectField label="Love language" value={form.loveLanguage} onChange={(e) => setField("loveLanguage", e.target.value)} options={LOVE_LANGUAGE_OPTIONS} />
        <SelectField label="In a disagreement, I…" value={form.conflictStyle} onChange={(e) => setField("conflictStyle", e.target.value)} options={CONFLICT_OPTIONS} />
      </div>
    </FormSection>
  );
}

export function LifestyleSection({ pf, span = 12 }) {
  const { form, setField } = pf;
  return (
    <FormSection id="lifestyle" span={span} title="Lifestyle" description="Everyday habits." icon={<Coffee size={18} />}>
      <div className="form-grid">
        <SelectField label="Drinking" value={form.drinkHabit} onChange={(e) => setField("drinkHabit", e.target.value)} options={DRINK_OPTIONS} />
        <SelectField label="Smoking" value={form.smokeHabit} onChange={(e) => setField("smokeHabit", e.target.value)} options={SMOKE_OPTIONS} />
        <SelectField label="Diet" value={form.foodPreference} onChange={(e) => setField("foodPreference", e.target.value)} options={FOOD_OPTIONS} />
        <SelectField label="Sleep schedule" value={form.sleepStyle} onChange={(e) => setField("sleepStyle", e.target.value)} options={SLEEP_OPTIONS} />
      </div>
    </FormSection>
  );
}

export function PersonalitySection({ pf, span = 12 }) {
  const { form, toggleInList } = pf;
  return (
    <FormSection id="personality" span={span} title="Personality & interests" description="Pick as many as apply." icon={<Sparkles size={18} />}>
      <div className="stack">
        <ChipGroup label="Personality" hint="Pick a few" options={PERSONALITY_OPTIONS} value={form.personalityTraits} onToggle={(v) => toggleInList("personalityTraits", v)} />
        <ChipGroup label="Interests" hint="Used to make your feed more relevant" options={INTEREST_OPTIONS} value={form.interests} onToggle={(v) => toggleInList("interests", v)} />
      </div>
    </FormSection>
  );
}

export function ValuesSection({ pf, span = 12 }) {
  const { form, toggleInList } = pf;
  return (
    <FormSection id="values" span={span} title="Values & dealbreakers" description="What matters to you, and what doesn't work for you." icon={<Shield size={18} />}>
      <div className="stack">
        <ChipGroup label="Values" hint="What you care about" options={CORE_VALUE_OPTIONS} value={form.coreValues} onToggle={(v) => toggleInList("coreValues", v)} />
        <ChipGroup label="Dealbreakers" hint="Optional" options={DEALBREAKER_OPTIONS} value={form.dealbreakers} onToggle={(v) => toggleInList("dealbreakers", v)} />
      </div>
    </FormSection>
  );
}

export function IntroSection({ pf, span = 12 }) {
  return (
    <>
      <FormSection id="opening" span={span} title="Opening line" description="Give people an easy way to start the conversation." icon={<MessageCircle size={18} />}>
        <OpeningLinePicker choice={pf.openingChoice} custom={pf.openingCustom} onChoice={pf.setOpeningChoice} onCustom={pf.setOpeningCustom} />
      </FormSection>
      <FormSection id="prompts" span={span} title="Prompts" description="Choose up to 3 and answer in your own words." icon={<Star size={18} />}>
        <PromptPicker prompts={pf.prompts} onChange={pf.setPrompts} />
      </FormSection>
    </>
  );
}
