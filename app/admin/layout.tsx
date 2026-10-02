import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Re-reads role/is_blocked from the DB on every request — the real guard.
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-end border-b border-ink/10 bg-cream px-8 py-4 lg:flex">
          <p className="font-mono text-xs text-ink-soft">
            Signed in as{" "}
            <span className="font-semibold text-ink">{admin.email}</span>
          </p>
        </header>
        <main className="flex-1 bg-parchment/40 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
