import { useState, useRef } from "react";
import { FieldError } from "../ui/FormField";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ThumbnailUploader({
  onFileChange,
  error: externalError,
}) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef();

  const validateAndSet = (f) => {
    setLocalError(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      setLocalError("Only JPG, PNG, or WebP images are allowed");
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setLocalError(
        `Image must be under ${MAX_SIZE_MB}MB (current: ${(f.size / 1024 / 1024).toFixed(1)}MB)`,
      );
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (onFileChange) onFileChange(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setLocalError(null);
    inputRef.current.value = "";
    if (onFileChange) onFileChange(null);
  };

  const displayError = localError || externalError;
  const hasError = !!displayError;

  return (
    <div>
      <p className="text-xs font-semibold text-black tracking-widest uppercase mb-3">
        Thumbnail Image
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden
          ${dragging ? "border-blue-400 bg-blue-50 scale-[1.01]" : ""}
          ${hasError && !dragging ? "border-red-300 bg-red-50" : ""}
          ${!hasError && !dragging ? "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50" : ""}
        `}
        style={{ minHeight: "150px" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleChange}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Thumbnail preview"
              className="w-full h-36 object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow transition-colors"
              title="Remove image"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 truncate">
              {file.name}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 px-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${hasError ? "bg-red-100" : "bg-blue-100"}`}
            >
              <svg
                className={`w-5 h-5 ${hasError ? "text-red-400" : "text-blue-500"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold text-black text-center">
              DRAG & DROP
            </p>
            <p className="text-xs text-black text-center leading-relaxed">
              or click to browse files from your computer
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-black mt-1.5 text-center">
        JPG, PNG, WebP · Max {MAX_SIZE_MB}MB · Recommended 1280×720px
      </p>

      <FieldError message={displayError} />
    </div>
  );
}
