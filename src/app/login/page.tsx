"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      const next = params.get("callbackUrl") ?? "/";
      router.push(next);
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm border border-silver-gray/30 bg-black/40 p-6"
    >
      <h1 className="font-display text-2xl tracking-widest text-amber">LOG IN</h1>
      <label className="mt-4 block text-xs uppercase tracking-wider text-silver-gray">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full border border-silver-gray/40 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber"
        />
      </label>
      <label className="mt-3 block text-xs uppercase tracking-wider text-silver-gray">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full border border-silver-gray/40 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber"
        />
      </label>
      {error && <p className="mt-3 text-sm text-cardinal">{error}</p>}
      <button
        type="submit"
        className="mt-5 w-full bg-cardinal py-2.5 font-display text-sm uppercase tracking-widest text-bone-white hover:bg-cardinal/80"
      >
        Enter
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