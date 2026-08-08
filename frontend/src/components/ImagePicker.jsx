import { useRef } from "react";
import { readImageFile } from "../utils/image";
import Icon from "./icons";

// Reusable image upload control with live preview and format/size validation.
// value = base64 data URL string (or ""). onChange(dataUrl). onError(message).
export default function ImagePicker({ value, onChange, onError, label = "Hospital photo" }) {
  const inputRef = useRef(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      onError?.("");
      onChange(dataUrl);
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div className="img-picker">
        <div className="img-preview">
          {value ? <img src={value} alt="Hospital preview" /> : <Icon name="hospital" size={26} />}
        </div>
        <div className="img-picker-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={pick}>
            {value ? "Change photo" : "Upload photo"}
          </button>
          {value && (
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange("")}>
              Remove
            </button>
          )}
          <p className="hint">PNG, JPG, GIF, WEBP or BMP · max 2 MB</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
    </div>
  );
}
