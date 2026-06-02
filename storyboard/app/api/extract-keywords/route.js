import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing 'text' field." }, { status: 400 });
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Extract 6-12 vivid visual keywords or short phrases from this script/text. These will be used as stickman-style illustration prompts. Return ONLY a JSON array of strings, no explanation, no markdown, no backticks. Example: ["running figure","dark forest","glowing door","silhouette on hill"]\n\nText:\n${text}`,
        },
      ],
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text();
    return NextResponse.json(
      { error: `Anthropic API error: ${anthropicRes.status}`, detail: err },
      { status: anthropicRes.status }
    );
  }

  const data = await anthropicRes.json();
  const raw = data.content?.map((b) => b.text || "").join("").trim();
  const clean = raw.replace(/```json|```/g, "").trim();

  let keywords;
  try {
    keywords = JSON.parse(clean);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse keywords from model response.", raw },
      { status: 500 }
    );
  }

  return NextResponse.json({ keywords });
}
