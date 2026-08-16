import { createServerFn } from "@tanstack/react-start";

export type AiAction = "continue" | "tighten" | "title" | "tags" | "next" | "prompt" | "expand" | "ask";

export type AiInput = {
  action: AiAction;
  title?: string;
  content?: string;
  query?: string;
  titles?: string[];
};

const LIMITS: Record<AiAction, number> = {
  continue: 220,
  tighten: 500,
  title: 40,
  tags: 48,
  next: 220,
  prompt: 90,
  expand: 280,
  ask: 360,
};

function systemFor(action: AiAction, titles: string[]) {
  const catalog = titles.slice(0, 24).join(", ");
  const vault = catalog ? `Existing notes in the vault: ${catalog}.` : "The vault is new.";
  const common = `You help with a private Markdown notebook called Kalam. ${vault} Write like a careful person, not a chatbot. No emoji. No preamble.`;

  switch (action) {
    case "continue":
      return `${common} Continue the note in the same voice. Output only the next paragraph or two of Markdown to append. Do not repeat what is already written.`;
    case "tighten":
      return `${common} Rewrite the note more clearly. Keep facts, tasks, wiki links [[like this]], and #tags. Output the full revised Markdown only.`;
    case "title":
      return `${common} Propose one short title, max 7 words. Output the title only, no quotes.`;
    case "tags":
      return `${common} Suggest 2 to 4 lowercase #tags that fit. Output a single space-separated line like #work #home`;
    case "next":
      return `${common} Suggest three concrete next steps as Markdown checkboxes. Output only:\n## Next\n- [ ] ...`;
    case "prompt":
      return `${common} Give one quiet writing prompt for today's page, one or two sentences. No heading.`;
    case "expand":
      return `${common} Turn a short capture into a small Markdown note: a title line as # heading, then a few sentences or a list. Keep it brief.`;
    case "ask":
      return `${common} Answer using the notebook. If drafting a note, use Markdown. Be useful and short.`;
  }
}

export const runKalam = createServerFn({ method: "POST" })
  .validator((input: AiInput) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available right now." };

    const userBits = [
      data.title ? `Title: ${data.title}` : "",
      data.content ? `Note:\n${data.content.slice(0, 6000)}` : "",
      data.query ? `Request: ${data.query}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: LIMITS[data.action],
        temperature: data.action === "tighten" ? 0.3 : 0.6,
        messages: [
          { role: "system", content: systemFor(data.action, data.titles ?? []) },
          { role: "user", content: userBits || "Give a useful line." },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: "The pen is dry. Try again in a moment." };
    }

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Nothing came back." };
    return { ok: true as const, text };
  });
