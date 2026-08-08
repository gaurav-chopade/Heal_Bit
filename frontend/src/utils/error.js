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

/**
 * Same as getErrorMessage, but for requests made with `responseType: "blob"`.
 * Axios hands the error body back as a Blob, so the real message has to be read out of it
 * asynchronously — otherwise every failure looks like a generic "Something went wrong".
 */
export async function getBlobErrorMessage(err) {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed.fieldErrors) {
        const first = Object.values(parsed.fieldErrors)[0];
        if (first) return first;
      }
      if (parsed.message) return parsed.message;
    } catch {
      /* not JSON — fall through */
    }
  }
  return getErrorMessage(err);
}
