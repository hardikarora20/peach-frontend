// The only fields a profile needs before the app unlocks – same five the backend checks
// in ProfileRepository.existsCompleteCoreProfile. Photos and everything else are optional.
export function missingEssentials(profile) {
  if (!profile) return ["profile"];
  const has = (v) => v !== null && v !== undefined && String(v).trim() !== "";
  const missing = [];
  if (!has(profile.name)) missing.push("name");
  const age = Number(profile.age);
  if (!Number.isFinite(age) || age < 18) missing.push("age");
  if (!has(profile.gender)) missing.push("gender");
  if (!has(profile.location)) missing.push("city");
  if (!has(profile.bio)) missing.push("bio");
  return missing;
}

export const hasEssentials = (profile) => missingEssentials(profile).length === 0;
