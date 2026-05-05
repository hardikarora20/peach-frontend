import React, { useEffect, useState } from "react";
import { profileApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Loader, Select, Textarea } from "../components/UI";

const initial = {
  name: "",
  age: "",
  gender: "",
  bio: "",
  location: "",
};

export default function ProfilePage() {
  const { profile, setProfile, refreshMe } = useAuth();
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await profileApi.me();
        const me = data?.profile || data?.data || data || {};
        if (mounted) {
          setValues({
            name: me.name || "",
            age: me.age ?? "",
            gender: me.gender || "",
            bio: me.bio || "",
            location: me.location || "",
          });
          setProfile(me);
        }
      } catch {
        if (mounted && profile) {
          setValues({
            name: profile.name || "",
            age: profile.age ?? "",
            gender: profile.gender || "",
            bio: profile.bio || "",
            location: profile.location || "",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        name: values.name.trim(),
        age: Number(values.age),
        gender: values.gender,
        bio: values.bio.trim(),
        location: values.location.trim(),
      };
      const data = await profileApi.saveMe(payload);
      const me = data?.profile || data?.data || data || payload;
      setProfile(me);
      await refreshMe().catch(() => {});
      setNotice("Profile saved successfully.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not save profile";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-card">
        <Loader label="Loading profile" />
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="page-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Profile</span>
            <h2>Set up your Peach profile</h2>
          </div>
          <div className="pill">
            {profile?.name ? "Profile ready" : "Needs setup"}
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <Input
            label="Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
          <Input
            label="Age"
            name="age"
            type="number"
            min="18"
            value={values.age}
            onChange={handleChange}
            placeholder="21"
            required
          />
          <Select
            label="Gender"
            name="gender"
            value={values.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </Select>
          <Input
            label="Location"
            name="location"
            value={values.location}
            onChange={handleChange}
            placeholder="Mumbai"
            required
          />
          <Textarea
            label="Bio"
            name="bio"
            rows="5"
            value={values.bio}
            onChange={handleChange}
            placeholder="Write a short bio"
          />
          {error ? <div className="form-error">{error}</div> : null}
          {notice ? <div className="form-success">{notice}</div> : null}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </section>

      <aside className="page-card preview-card">
        <span className="eyebrow">Preview</span>
        <div className="profile-preview">
          <div className="preview-avatar">
            {(values.name || "P")[0]?.toUpperCase()}
          </div>
          <h3>{values.name || "Your name"}</h3>
          <p>
            {values.age
              ? `${values.age} • ${values.gender || "gender"}`
              : "Age • Gender"}
          </p>
          <p>{values.location || "Location"}</p>
          <div className="preview-bio">
            {values.bio || "Your bio appears here."}
          </div>
        </div>
      </aside>
    </div>
  );
}
