"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="flex items-center justify-between border-b border-ink/10 bg-cream px-4 py-3 lg:hidden">
        <span className="font-display text-lg font-semibold tracking-tight">
          Admin
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle admin menu"
          aria-expanded={open}
          className="rounded-full border border-ink/15 bg-parchment p-2 hover:bg-sand"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden
          >
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar: horizontal drawer on mobile, fixed column on desktop */}
      <aside
        className={`${open ? "block" : "hidden"} border-b border-ink/10 bg-cream lg:sticky lg:top-0 lg:block lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r`}
      >
        <nav className="flex flex-col gap-1 p-4">
          <p className="hidden px-3 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-soft/60 lg:block">
            Admin
          </p>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:bg-parchment hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="mt-2 rounded-full px-3 py-2 text-sm font-medium text-ink-soft/70 hover:bg-parchment hover:text-ink"
          >
            ← Back to store
          </Link>
        </nav>
      </aside>
    </>
  );
}
