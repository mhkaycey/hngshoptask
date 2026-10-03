"use client";

import { useState, useTransition } from "react";
import { submitReview, deleteReview } from "@/app/actions/reviews";
import { Button } from "@/components/ui/Button";

export default function ReviewForm({
  productId,
  initialRating,
  initialComment,
}: {
  productId: string;
  initialRating?: number;
  initialComment?: string | null;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(initialComment ?? "");
  const [status, setStatus] = useState<{
    kind: "idle" | "ok" | "error";
    message?: string;
  }>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  const displayStars = hovered || rating;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating < 1) {
      setStatus({ kind: "error", message: "Choose a star rating" });
      return;
    }
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("rating", String(rating));
    formData.set("comment", comment);
    startTransition(async () => {
      const result = await submitReview(formData);
      setStatus(
        result.success
          ? { kind: "ok", message: "Thanks for your review!" }
          : { kind: "error", message: result.message }
      );
    });
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteReview(productId);
      if (result.success) {
        setRating(0);
        setComment("");
        setStatus({ kind: "idle" });
      } else {
        setStatus({ kind: "error", message: result.message });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className={`text-2xl transition-transform hover:scale-110 ${
              star <= displayStars ? "text-gold" : "text-ink/20"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="Share what you thought of this product…"
        className="w-full rounded-2xl border border-ink/15 bg-parchment p-4 text-sm leading-6 text-ink placeholder:text-ink/35 focus:border-clay focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : initialRating ? "Update review" : "Submit review"}
        </Button>
        {initialRating && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDelete}
            disabled={pending}
          >
            Delete my review
          </Button>
        )}
      </div>

      {status.kind !== "idle" && (
        <p
          className={`font-mono text-xs ${
            status.kind === "ok" ? "text-moss" : "text-clay-deep"
          }`}
          role="status"
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
