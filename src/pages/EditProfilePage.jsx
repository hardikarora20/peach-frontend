import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const initialState = {
  name: "",
  age: "",
  gender: "",
  location: "",
  bio: "",

  datingIntent: "",
  connectionPreference: "",
  openToLongDistance: "",

  personalityTraits: [],
  communicationStyle: "",
  loveLanguage: "",
  conflictStyle: "",

  drinkHabit: "",
  smokeHabit: "",
  foodPreference: "",
  sleepStyle: "",

  coreValues: [],
  dealbreakers: [],
  interests: [],
};

function humanize(value) {
  return value.replace(/_/g, " ").toLowerCase();
}

function toggleArray(setter, state, key, value) {
  const arr = state[key];
  if (arr.includes(value)) {
    setter({ ...state, [key]: arr.filter((v) => v !== value) });
  } else {
    setter({ ...state, [key]: [...arr, value] });
  }
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setForm({ ...initialState, ...(data?.data || data) });
    };
    load();
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("peach_token");

    await fetch(`${API_BASE}/profile/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setLoading(false);
    navigate("/app/profile");
  };

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-topbar">
          <button className="profile-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>Edit Profile</h1>
        </div>

        <form className="edit-form" onSubmit={handleSubmit}>
          {/* BASIC */}
          <section className="card">
            <h3>Basic</h3>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />

            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>

            <textarea
              placeholder="Bio"
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
            />
          </section>

          {/* DATING */}
          <section className="card">
            <h3>Dating</h3>

            <select
              value={form.datingIntent}
              onChange={(e) => update("datingIntent", e.target.value)}
            >
              <option value="">Intent</option>
              <option value="SERIOUS_RELATIONSHIP">Serious</option>
              <option value="CASUAL">Casual</option>
            </select>

            <select
              value={form.connectionPreference}
              onChange={(e) => update("connectionPreference", e.target.value)}
            >
              <option value="">Connection</option>
              <option value="LONG_TERM">Long term</option>
              <option value="SHORT_TERM">Short term</option>
              <option value="OPEN_TO_BOTH">Both</option>
            </select>

            <select
              value={form.openToLongDistance}
              onChange={(e) => update("openToLongDistance", e.target.value)}
            >
              <option value="">Long distance</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
              <option value="MAYBE">Maybe</option>
            </select>
          </section>

          {/* MULTI SELECT */}
          <section className="card">
            <h3>Personality</h3>

            {["INTROVERT", "EXTROVERT", "FUNNY", "DEEP_THINKER"].map((t) => (
              <button
                type="button"
                key={t}
                className={
                  form.personalityTraits.includes(t) ? "pill active" : "pill"
                }
                onClick={() =>
                  toggleArray(setForm, form, "personalityTraits", t)
                }
              >
                {humanize(t)}
              </button>
            ))}
          </section>

          {/* LIFESTYLE */}
          <section className="card">
            <h3>Lifestyle</h3>

            <select
              value={form.drinkHabit}
              onChange={(e) => update("drinkHabit", e.target.value)}
            >
              <option value="">Drinks</option>
              <option value="YES">Yes</option>
              <option value="OCCASIONALLY">Occasionally</option>
              <option value="NO">No</option>
            </select>

            <select
              value={form.smokeHabit}
              onChange={(e) => update("smokeHabit", e.target.value)}
            >
              <option value="">Smokes</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
          </section>

          {/* INTERESTS */}
          <section className="card">
            <h3>Interests</h3>

            {["GYM", "TRAVEL", "MUSIC", "MOVIES", "FOOD"].map((i) => (
              <button
                type="button"
                key={i}
                className={form.interests.includes(i) ? "pill active" : "pill"}
                onClick={() => toggleArray(setForm, form, "interests", i)}
              >
                {humanize(i)}
              </button>
            ))}
          </section>

          <button className="save-btn" type="submit">
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
