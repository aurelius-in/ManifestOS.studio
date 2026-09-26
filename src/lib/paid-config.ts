import { storeReady } from "@/lib/blob-store";

export const BLUEPRINT_PRICE_CENTS = Number(process.env.BLUEPRINT_PRICE_CENTS || 2900);
export const BLUEPRINT_PRICE_LABEL = `$${(BLUEPRINT_PRICE_CENTS / 100).toFixed(BLUEPRINT_PRICE_CENTS % 100 ? 2 : 0)}`;
export const BLUEPRINT_NAME = "Build-Ready Blueprint";

export const KEEP_PLANNED_LABEL = "$9/month";

export function stripeKey(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

export function llmReady(): boolean {
  return Boolean(process.env.GROK_API_KEY?.trim() || process.env.XAI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim());
}

/** The buy button only appears when payment, writing, and storage all work. */
export function blueprintSaleReady(): boolean {
  return Boolean(stripeKey()) && llmReady() && storeReady();
}

export function siteUrl(req?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (req) return new URL(req.url).origin;
  return "https://manifestos.studio";
}
