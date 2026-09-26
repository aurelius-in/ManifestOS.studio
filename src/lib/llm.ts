/**
 * OpenAI-compatible chat call. Prefers xAI (Grok), falls back to OpenAI.
 */

function provider() {
  const grok = process.env.GROK_API_KEY?.trim() || process.env.XAI_API_KEY?.trim();
  if (grok) {
    return { url: "https://api.x.ai/v1/chat/completions", key: grok, model: process.env.GROK_MODEL?.trim() || "grok-4.5" };
  }
  const openai = process.env.OPENAI_API_KEY?.trim();
  if (openai) {
    return { url: "https://api.openai.com/v1/chat/completions", key: openai, model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1" };
  }
  return null;
}

export async function completeJson(system: string, user: string): Promise<unknown> {
  const p = provider();
  if (!p) throw new Error("No AI provider is configured.");
  const res = await fetch(p.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: p.model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string } | string;
  };
  if (!res.ok) {
    const message = typeof body.error === "string" ? body.error : body.error?.message;
    throw new Error(message || `AI provider ${res.status}`);
  }
  const text = body.choices?.[0]?.message?.content || "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("AI returned no JSON.");
  return JSON.parse(text.slice(start, end + 1));
}
