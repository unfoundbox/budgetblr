import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { listSpotsForMap } from "@/lib/queries/spots";
import { formatPrice } from "@/lib/constants";

export const runtime = "nodejs";

// Default to the most capable model; override with ANTHROPIC_MODEL
// (e.g. claude-haiku-4-5 for a cheaper / faster search box).
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "slugs"],
  properties: {
    reply: { type: "string", description: "One short, friendly sentence. No markdown." },
    slugs: {
      type: "array",
      items: { type: "string" },
      description: "Slugs of the best 3–6 matching spots from the catalog, most relevant first. Empty if nothing fits.",
    },
  },
} as const;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI search is not configured." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query) return NextResponse.json({ error: "Missing query." }, { status: 400 });
  if (query.length > 500) return NextResponse.json({ error: "Query too long." }, { status: 400 });

  const spots = await listSpotsForMap();
  const valid = new Set(spots.map((s) => s.slug));
  const catalog = spots
    .map((s) =>
      [
        s.slug,
        s.name,
        s.category?.slug,
        s.neighborhood?.name ?? "",
        formatPrice(s.price_min, s.price_max, s.price_unit),
        (s.why_worth_it ?? "").slice(0, 100),
      ].join(" | "),
    )
    .join("\n");

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text:
            "You are budgetblr's search assistant. You help people find genuinely budget-friendly spots in Bengaluru (Bangalore). Recommend ONLY spots from the catalog that match the user's intent — never invent a name or slug. Keep `reply` to one short, warm sentence with no markdown. Put the best 3–6 matches in `slugs`, most relevant first; if nothing fits, return an empty list and say so kindly.",
        },
        {
          type: "text",
          text: `Catalog (slug | name | category | area | price | why):\n${catalog}`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: query }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const text = message.content.find((b) => b.type === "text");
    const parsed = text && "text" in text ? JSON.parse(text.text) : { reply: "", slugs: [] };
    const slugs: string[] = Array.isArray(parsed.slugs)
      ? parsed.slugs.filter((s: unknown) => typeof s === "string" && valid.has(s)).slice(0, 6)
      : [];
    const reply = typeof parsed.reply === "string" && parsed.reply ? parsed.reply : "Here's what I found.";
    return NextResponse.json({ reply, slugs });
  } catch (err) {
    console.error("ask route error", err);
    return NextResponse.json({ error: "Search failed, please try again." }, { status: 500 });
  }
}
