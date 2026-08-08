// Lightweight password strength scoring for the registration forms.
export function passwordStrength(pw = "") {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  // Collapse to 0..4
  const level = Math.min(4, score);
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  return { level, label: labels[level] };
}

// Backend rule: >=8 chars, one lower, one upper, one digit.
export function meetsPolicy(pw = "") {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
}
