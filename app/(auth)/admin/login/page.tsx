import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Admin login" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="grain flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-parchment p-8 shadow-[6px_6px_0_0_var(--color-sand)]">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-clay">
          Restricted
        </span>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Admin sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Sign in with your admin email and password.
        </p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
