import { useState } from "react";

/**
 * Lightweight form validation with live feedback.
 * @param initialValues  object of field -> value
 * @param validate       (values) => { field: "error message" }  (only invalid fields present)
 *
 * Errors are only *shown* for fields the user has touched (blurred/typed) or after a submit attempt,
 * but they recompute on every keystroke — so they clear/update live once visible.
 */
export function useFormValidation(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const allErrors = validate(values) || {};

  const errors = {};
  for (const key of Object.keys(allErrors)) {
    if (submitted || touched[key]) errors[key] = allErrors[key];
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));
  const setValue = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const reset = (next) => { setValues(next); setTouched({}); setSubmitted(false); };

  const isValid = Object.keys(allErrors).length === 0;

  const handleSubmit = (onValid) => (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (isValid) onValid(values);
  };

  // Spread onto an <input>/<select>: gives name, value, onChange, onBlur.
  const field = (name) => ({ name, value: values[name] ?? "", onChange, onBlur });

  return { values, setValues, setValue, reset, errors, isValid, onChange, onBlur, field, handleSubmit, submitted };
}
