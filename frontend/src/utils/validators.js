import { meetsPolicy } from "./password";

// --- predicates ---
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
export const isPhone10 = (v) => /^\d{10}$/.test(v || "");
export const isPincode6 = (v) => /^\d{6}$/.test(v || "");

// --- field validators: return "" when valid, else a message ---
export const isAlphaName = (v) => /^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(String(v ?? "").trim());

export const vRequired = (v, label = "This field") => (String(v ?? "").trim() ? "" : `${label} is required.`);
export const vName = (v) => {
  const val = String(v ?? "").trim();
  if (val.length < 3) return "Enter a full name (at least 3 characters).";
  if (!isAlphaName(val)) return "Name can only contain alphabets (letters and single spaces between words).";
  return "";
};
export const vEmail = (v) => (isEmail(v) ? "" : "Enter a valid email address.");
export const vPhone = (v) => (isPhone10(v) ? "" : "Phone must be exactly 10 digits.");
export const vPincode = (v) => (isPincode6(v) ? "" : "Pincode must be exactly 6 digits.");
export const vPassword = (v) => (meetsPolicy(v) ? "" : "At least 8 characters with an uppercase, a lowercase, and a number.");
export const vConfirm = (confirm, password) =>
  !confirm ? "Please confirm your password." : (confirm !== password ? "Passwords do not match." : "");
export const vAge = (v) => {
  const n = Number(v);
  return v !== "" && v != null && Number.isFinite(n) && n >= 1 && n <= 120 ? "" : "Enter a valid age (1–120).";
};

// Validate only when a value is present (for optional fields).
export const optional = (v, validator) => (String(v ?? "").trim() ? validator(v) : "");
