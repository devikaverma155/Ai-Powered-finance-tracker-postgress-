import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { incomes = [], expenses = [], plan = {}, goals = [] } = body;

  if (!process.env.SAMBANOVA_API_KEY) {
    return NextResponse.json({ error: "SAMBANOVA_API_KEY not configured" }, { status: 500 });
  }

  const base = process.env.SAMBANOVA_BASE_URL || "https://api.sambanova.ai/v1";
  const url = `${base.replace(/\/$/, "")}/chat/completions`;

  const prompt = `You are a financial advisor AI.
Given the following user details:
- Income sources: ${JSON.stringify(incomes)}
- Expenses: ${JSON.stringify(expenses)}
- Goals: ${JSON.stringify(goals)}
- Current allocation plan: ${JSON.stringify(plan)}

Provide concise, actionable advice to improve savings and investments, balance necessities vs luxuries, and a simple allocation recommendation.`;

  const payload = {
    model: "DeepSeek-V3.1-Terminus",
    messages: [
      { role: "system", content: "You are a helpful and practical financial assistant." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    top_p: 0.9
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Try Bearer then fallback to x-api-key; adjust if your SambaNova account uses a different header
        Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`,
        "x-api-key": process.env.SAMBANOVA_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    // defensive extraction
    const aiText =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.output ||
      JSON.stringify(data);

    if (!res.ok) {
      return NextResponse.json({ error: aiText }, { status: res.status || 500 });
    }

    return NextResponse.json({ aiText });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
