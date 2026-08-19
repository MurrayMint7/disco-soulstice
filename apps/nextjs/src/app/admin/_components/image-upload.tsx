"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImageFile } from "@disco/storage/client";

export function ImageUpload({
  label = "Image",
  value,
  onChange,
  folder,
  required,
}: {
  label?: string;
  value: string;
  onChange: (result: { url: string; pathname: string }) => void;
  folder: string;
  required?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await uploadImageFile(file, folder);
      onChange(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="font-body text-cream-200/80 text-sm block mb-1">
        {label}
      </label>

      {value && (
        <div className="relative w-full max-w-xs aspect-video mb-2 rounded-lg overflow-hidden border border-border/50">
          <Image src={value} alt="" fill className="object-cover" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
        className="hidden"
        required={required && !value}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm hover:border-primary transition-colors disabled:opacity-50"
      >
        {isUploading
          ? "Uploading..."
          : value
            ? "Replace Image"
            : "Choose Image (camera or library)"}
      </button>

      {error && <p className="font-body text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
