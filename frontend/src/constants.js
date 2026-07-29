// Shared, front-end-wide constants.

// NOTE: Specializations used to be hardcoded here. They now live in a database-backed master
// table managed by admins and are fetched at runtime via specializationApi.getSpecializations().

// value = stored token, label = display
export const WEEK_DAYS = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

// Roles offered on the sign-in chooser (navbar + home).
export const SIGN_IN_OPTIONS = [
  { path: "/patient/login", label: "Patient", description: "Book and manage your appointments", icon: "user" },
  { path: "/doctor/login", label: "Doctor", description: "Manage your schedule and appointments", icon: "stethoscope" },
  { path: "/hospital/login", label: "Hospital", description: "Manage doctors and view insights", icon: "hospital" },
  { path: "/admin/login", label: "Administrator", description: "Approve hospitals and oversee the platform", icon: "chart" },
];

// Palette used across recharts dashboards.
export const CHART = {
  primary: "#0f766e",
  primaryLight: "#5eb0a8",
  accent: "#e8734f",
  green: "#15803d",
  amber: "#b45309",
  red: "#b91c1c",
  blue: "#1d4ed8",
  teal: "#0891b2",
  grid: "#e6ede9",
  axis: "#5c6b66",
};

export const STATUS_COLORS = {
  PENDING: "#b45309",
  CONFIRMED: "#15803d",
  COMPLETED: "#0f766e",
  REJECTED: "#b91c1c",
  CANCELLED: "#9ca3af",
};

// Google reCAPTCHA v2 site key (override with VITE_RECAPTCHA_SITE_KEY in an .env file).
export const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeYHGgtAAAAAKArqcFg-70uSKuR34X_E5yN-YEr";
