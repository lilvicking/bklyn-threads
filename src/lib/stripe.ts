import Stripe from "stripe";

// Build a Stripe client from the secret key.
let _client: Stripe | null = null;

export function createServerClient(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  _client = new Stripe(key, { apiVersion: "2024-11-20.acacia" });
  return _client;
}