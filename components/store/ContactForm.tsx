"use client";

import { useState, useTransition } from "react";
import { sendSupportMessage } from "@/app/actions/support";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "w-full rounded-2xl border border-ink/15 bg-parchment px-4 py-3 text-sm leading-6 text-ink placeholder:text-ink/35 focus:border-clay focus:outline-none";

export default function ContactForm() {
  const [status, setStatus] = useState<{
    kind: "idle" | "ok" | "error";
    message?: string;
  }>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await sendSupportMessage(formData);
      setStatus(
        result.success
          ? {
              kind: "ok",
              message:
                "Message sent! Our support team will reply to your email shortly.",
            }
          : { kind: "error", message: result.message }
      );
      if (result.success) form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
            Name
          </span>
          <input name="name" required maxLength={200} className={inputClasses} placeholder="Ada Lovelace" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            maxLength={255}
            className={inputClasses}
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
          Subject
        </span>
        <input name="subject" required maxLength={200} className={inputClasses} placeholder="Order question" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={5000}
          className={inputClasses}
          placeholder="How can we help?"
        />
      </label>
      <Button type="submit" disabled={pending} className="self-start px-10">
        {pending ? "Sending…" : "Send message"}
      </Button>
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
