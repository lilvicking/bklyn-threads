"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setError(null);
    // Password-only login (pairtalk-style): no email field — the password is
    // checked against ADMIN_PASSWORD and provisions the ADMIN account.
    const res = await signIn("credentials", {
      password,
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      setError("Invalid password.");
    } else {
      const next = params.get("callbackUrl") ?? "/admin";
      router.push(next);
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm border border-silver-gray/30 bg-black/40 p-8 text-center"
    >
      <h1 className="font-display text-2xl tracking-widest text-amber">
        JAY FAB
      </h1>
      <p className="mt-1 text-xs uppercase tracking-wider text-silver-gray">
        Enter your admin password to continue.
      </p>
      <label className="mt-6 block text-left text-xs uppercase tracking-wider text-silver-gray">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
          required
          className="mt-1 w-full border border-silver-gray/40 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber"
        />
      </label>
      {error && <p className="mt-3 text-sm text-cardinal">{error}</p>}
      <button
        type="submit"
        disabled={busy || !password.trim()}
        className="mt-5 w-full bg-cardinal py-2.5 font-display text-sm uppercase tracking-widest text-bone-white hover:bg-cardinal/80 disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}