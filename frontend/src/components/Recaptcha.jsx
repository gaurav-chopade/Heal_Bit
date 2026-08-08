import { useEffect, useRef } from "react";
import { RECAPTCHA_SITE_KEY } from "../constants";

// Load the Google reCAPTCHA script once, shared across all widgets.
let scriptPromise = null;
function loadRecaptcha() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    if (window.grecaptcha && window.grecaptcha.render) return resolve();
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Google reCAPTCHA v2 ("I'm not a robot") checkbox.
 * onToken(token) fires with the token when solved, and "" when it expires/errors.
 * Remount with a changing `key` prop to reset it after a failed submit.
 */
export default function Recaptcha({ onToken }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadRecaptcha().then(() => {
      window.grecaptcha.ready(() => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="captcha-box"><div ref={containerRef} /></div>;
}
