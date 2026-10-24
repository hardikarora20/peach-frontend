import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage, profileApi } from "../api/client";
import { WRITE_MY_OWN } from "../data/profileOptions";
import {
  buildPayload, calculateCompletion, emptyForm, getMissingBasics, profileToForm, promptsFromProfile, resolveOpeningLine,
} from "../utils/profile";

// All the profile-form state that Onboarding and Edit profile both need.
// Before this hook the same ~200 lines lived in both pages.
export default function useProfileForm() {
  const [form, setForm] = useState(emptyForm());
  const [prompts, setPrompts] = useState([]);
  const [openingChoice, setOpeningChoice] = useState("");
  const [openingCustom, setOpeningCustom] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const profile = await profileApi.me(); // null when the user has no profile yet
      if (profile) {
        setForm(profileToForm(profile));
        setPrompts(promptsFromProfile(profile));
        const opening = resolveOpeningLine(profile.openingLine);
        setOpeningChoice(opening.choice);
        setOpeningCustom(opening.custom);
      }
    } catch (err) {
      setLoadError(getErrorMessage(err, "Couldn't load your profile."));
    } finally {
      setLoading(false);
      setDirty(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const touch = () => setDirty(true);

  const setField = useCallback((field, value) => {
    touch();
    setForm((f) => ({ ...f, [field]: value }));
  }, []);

  const toggleInList = useCallback((field, value) => {
    touch();
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  }, []);

  const setImage = useCallback((index, value) => {
    touch();
    setForm((f) => {
      const images = [...f.images];
      images[index] = value;
      return { ...f, images };
    });
  }, []);

  const openingLine = openingChoice === WRITE_MY_OWN ? openingCustom : openingChoice;
  const completion = useMemo(() => calculateCompletion(form, openingLine, prompts), [form, openingLine, prompts]);
  const missingBasics = useMemo(() => getMissingBasics(form), [form]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await profileApi.saveMe(buildPayload(form, openingLine, prompts));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [form, openingLine, prompts]);

  return {
    form,
    setField,
    toggleInList,
    setImage,
    prompts,
    setPrompts: (p) => {
      touch();
      setPrompts(p);
    },
    openingChoice,
    setOpeningChoice: (v) => {
      touch();
      setOpeningChoice(v);
    },
    openingCustom,
    setOpeningCustom: (v) => {
      touch();
      setOpeningCustom(v);
    },
    completion,
    missingBasics,
    loading,
    loadError,
    reload: load,
    saving,
    save,
    dirty,
  };
}
