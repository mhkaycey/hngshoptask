"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getUploadSignature } from "@/app/actions/admin/uploads";
import { createProduct, updateProduct } from "@/app/actions/admin/products";

export type ProductFormDefaults = {
  id?: string;
  name?: string;
  description?: string | null;
  price?: string | null;
  stock?: number | null;
  category?: string | null;
  image_url?: string | null;
};

export default function ProductForm({
  defaults,
  categories,
}: {
  defaults?: ProductFormDefaults;
  categories: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(defaults?.image_url ?? "");
  const [preview, setPreview] = useState<string | null>(defaults?.image_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      // 1. Get a signed payload from our admin-only server action.
      const sig = await getUploadSignature();
      if (!sig.success) {
        throw new Error(sig.message);
      }

      // 2. Upload directly from the browser to Cloudinary.
      const upload = new FormData();
      upload.append("file", file);
      upload.append("api_key", sig.data.apiKey);
      upload.append("timestamp", String(sig.data.timestamp));
      upload.append("signature", sig.data.signature);
      upload.append("folder", sig.data.folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.data.cloudName}/image/upload`,
        { method: "POST", body: upload }
      );
      if (!response.ok) {
        throw new Error("Cloudinary rejected the upload.");
      }
      const result = (await response.json()) as { secure_url: string };
      setPreview(result.secure_url);
      setImageUrl(result.secure_url);
      setSuccess("Image uploaded.");
    } catch (err) {
      setPreview(imageUrl || null);
      setError(err instanceof Error ? err.message : "Image upload failed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);
    formData.set("image_url", imageUrl);

    startTransition(async () => {
      const result = defaults?.id
        ? await updateProduct(defaults.id, formData)
        : await createProduct(formData);

      if (result.success) {
        setSuccess("Product saved.");
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
          <Input id="name" name="name" required defaultValue={defaults?.name ?? ""} />
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">Category</label>
          <Input
            id="category"
            name="category"
            required
            list="category-options"
            defaultValue={defaults?.category ?? ""}
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium">Price</label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaults?.price ?? ""}
            />
          </div>
          <div>
            <label htmlFor="stock" className="mb-1 block text-sm font-medium">Stock</label>
            <Input
              id="stock"
              name="stock"
              type="number"
              step="1"
              min="0"
              required
              defaultValue={defaults?.stock ?? 0}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={defaults?.description ?? ""}
            className="w-full rounded-lg border border-ink/15 p-3 text-sm outline-none focus:border-clay"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="image">
            Product image
          </label>
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-cream"
          />
          <p className="mt-1 text-xs text-ink-soft/70">
            Uploaded directly to Cloudinary. Paste an existing Cloudinary URL otherwise.
          </p>
        </div>

        <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-xl border border-ink/10 bg-parchment">
          {preview ? (
            // Plain <img>: local blob: previews aren't supported by next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-soft/70">
              No image
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-parchment/70 text-sm font-medium">
              Uploading…
            </div>
          )}
        </div>

        <div>
          <label htmlFor="image_url" className="mb-1 block text-sm font-medium">
            Image URL
          </label>
          <Input
            id="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/…"
          />
        </div>

        {(error || success) && (
          <p
            role={error ? "alert" : "status"}
            className={`rounded-lg px-4 py-3 text-sm ${
              error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {error ?? success}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={pending || uploading}>
            {pending ? "Saving…" : "Save product"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
