"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { uploadImageFile, detectImageAspect } from "~/lib/upload-image";

export default function AdminGalleryPage() {
  const utils = api.useUtils();
  const { data: albums, isLoading } = api.gallery.listAlbums.useQuery();

  const createAlbum = api.gallery.createAlbum.useMutation({
    onSuccess: () => utils.gallery.listAlbums.invalidate(),
  });
  const deleteAlbum = api.gallery.deleteAlbum.useMutation({
    onSuccess: () => utils.gallery.listAlbums.invalidate(),
  });
  const addImage = api.gallery.addImage.useMutation({
    onSuccess: () => utils.gallery.listAlbums.invalidate(),
  });
  const deleteImage = api.gallery.deleteImage.useMutation({
    onSuccess: () => utils.gallery.listAlbums.invalidate(),
  });

  const [newAlbum, setNewAlbum] = useState({ label: "", date: "" });

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbum.label.trim()) return;
    const slug = newAlbum.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    createAlbum.mutate(
      { slug, label: newAlbum.label.trim(), date: newAlbum.date || undefined },
      { onSuccess: () => setNewAlbum({ label: "", date: "" }) },
    );
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Gallery
      </h1>

      <form
        onSubmit={handleCreateAlbum}
        className="max-w-xl flex gap-2 items-end mb-10"
      >
        <div className="flex-1">
          <label className="font-body text-cream-200/80 text-sm block mb-1">
            New Album
          </label>
          <input
            type="text"
            placeholder="e.g. Summer Rooftop Party"
            value={newAlbum.label}
            onChange={(e) =>
              setNewAlbum((prev) => ({ ...prev, label: e.target.value }))
            }
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="w-40">
          <label className="font-body text-cream-200/80 text-sm block mb-1">
            Date
          </label>
          <input
            type="text"
            placeholder="June 27, 2025"
            value={newAlbum.date}
            onChange={(e) =>
              setNewAlbum((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={createAlbum.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {createAlbum.isPending ? "Creating..." : "Create Album"}
        </button>
      </form>

      {isLoading && (
        <p className="font-body text-cream-200/50">Loading...</p>
      )}

      {!isLoading && albums?.length === 0 && (
        <p className="font-body text-cream-200/50">
          No albums yet. Create one above to start uploading photos.
        </p>
      )}

      <div className="space-y-10">
        {albums?.map((album) => (
          <AlbumSection
            key={album.id}
            album={album}
            onUpload={(image) => addImage.mutate({ albumId: album.id, ...image })}
            onDeleteImage={(id) => {
              if (confirm("Delete this photo?")) deleteImage.mutate({ id });
            }}
            onDeleteAlbum={() => {
              if (
                confirm(
                  `Delete "${album.label}" and all ${album.images.length} photo(s) in it?`,
                )
              ) {
                deleteAlbum.mutate({ id: album.id });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AlbumSection({
  album,
  onUpload,
  onDeleteImage,
  onDeleteAlbum,
}: {
  album: {
    id: number;
    label: string;
    date: string | null;
    images: { id: number; url: string }[];
  };
  onUpload: (image: {
    url: string;
    pathname: string;
    aspect: "square" | "portrait" | "landscape" | "wide";
  }) => void;
  onDeleteImage: (id: number) => void;
  onDeleteAlbum: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setError(null);
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const [uploaded, aspect] = await Promise.all([
          uploadImageFile(file, `gallery/${album.id}`),
          detectImageAspect(file),
        ]);
        onUpload({ ...uploaded, aspect });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-display text-lg font-bold text-foreground">
          {album.label}
        </h2>
        {album.date && (
          <span className="font-body text-amber-300/60 text-xs uppercase tracking-wider">
            {album.date}
          </span>
        )}
        <span className="font-body text-cream-200/30 text-xs">
          {album.images.length} photo{album.images.length === 1 ? "" : "s"}
        </span>

        <div className="ml-auto flex gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="font-body text-primary text-sm hover:underline disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "+ Add Photos"}
          </button>
          <button
            type="button"
            onClick={onDeleteAlbum}
            className="font-body text-red-400 text-sm hover:underline"
          >
            Delete Album
          </button>
        </div>
      </div>

      {error && <p className="font-body text-red-400 text-xs mb-2">{error}</p>}

      {album.images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {album.images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-border/30 group"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onDeleteImage(image.id)}
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-background/80 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                aria-label="Delete photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="warm-divider mt-6" />
    </div>
  );
}
