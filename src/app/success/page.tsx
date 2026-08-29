import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

async function SuccessContent({ sessionId }: { sessionId: string | null }) {
  if (!sessionId) {
    return (
      <p className="text-center text-silver-gray">
        No session information found.
      </p>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="h-16 w-16 text-amber" />
      </div>
      <h1 className="font-display text-4xl tracking-widest text-amber">
        ORDER CONFIRMED
      </h1>
      <p className="mt-4 text-sm text-silver-gray">
        Thank you for your purchase. Your order has been placed and a
        confirmation email is on its way.
      </p>
      <p className="mt-2 text-xs text-bone-white/60">
        Session: {sessionId}
      </p>
    </div>
  );
}

export default function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-4">
      <div className="w-full max-w-md border border-silver-gray/30 bg-black/40 p-8">
        <Suspense fallback={<p className="text-center text-silver-gray">Loading…</p>}>
          {/* searchParams is awaited by the Suspense boundary */}
          <SuccessContentWithParams searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

// Wrapper to await searchParams inside Suspense
async function SuccessContentWithParams({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <SuccessContent sessionId={params.session_id ?? null} />
      <Link
        href="/"
        className="mt-8 block w-full bg-cardinal py-3 font-display text-center text-sm
                   uppercase tracking-widest text-bone-white hover:bg-cardinal/80"
      >
        Back to Shop
      </Link>
    </>
  );
}
