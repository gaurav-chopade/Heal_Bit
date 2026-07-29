// Turns an axios error into a readable message, preferring the backend's
// validation field errors / message over a generic fallback.
export function getErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || "Something went wrong. Please try again.";
  if (data.fieldErrors) {
    const first = Object.values(data.fieldErrors)[0];
    if (first) return first;
  }
  return data.message || "Something went wrong. Please try again.";
}
