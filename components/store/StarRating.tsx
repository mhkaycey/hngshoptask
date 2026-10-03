/** Presentational star rating — safe in server components. */
export default function StarRating({
  value,
  size = "text-base",
}: {
  value: number;
  size?: string;
}) {
  return (
    <span
      className={`${size} tracking-wide text-gold`}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden className={star <= Math.round(value) ? "" : "text-ink/20"}>
          ★
        </span>
      ))}
    </span>
  );
}
