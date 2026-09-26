import { stripeKey } from "@/lib/paid-config";

type CheckoutSession = {
  id: string;
  url: string | null;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  status: "open" | "complete" | "expired";
  metadata: Record<string, string>;
  customer_details?: { email?: string | null } | null;
  amount_total?: number | null;
};

async function stripe<T>(method: "GET" | "POST", path: string, form?: Record<string, string>): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
    cache: "no-store",
  });
  const body = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(body.error?.message || `Stripe ${res.status}`);
  return body;
}

export function createBlueprintCheckout(input: {
  draftId: string;
  productName: string;
  description: string;
  amountCents: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSession> {
  return stripe<CheckoutSession>("POST", "/checkout/sessions", {
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(input.amountCents),
    "line_items[0][price_data][product_data][name]": input.productName,
    "line_items[0][price_data][product_data][description]": input.description.slice(0, 300),
    "metadata[product]": "manifestos_blueprint",
    "metadata[draft_id]": input.draftId,
    "payment_intent_data[metadata][product]": "manifestos_blueprint",
    "payment_intent_data[metadata][draft_id]": input.draftId,
    allow_promotion_codes: "true",
  });
}

export function getCheckoutSession(id: string): Promise<CheckoutSession> {
  return stripe<CheckoutSession>("GET", `/checkout/sessions/${encodeURIComponent(id)}`);
}
