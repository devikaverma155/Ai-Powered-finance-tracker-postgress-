import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase securely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, month, incomes = [], expenses = [], plan = {}, goals = [] } = body;

    if (!userId || !month) {
      return NextResponse.json({ error: "Missing userId or month" }, { status: 400 });
    }

    // ✅ Safe stringify helper (prevents circular reference errors)
    const safeStringify = (obj) => {
      try {
        return JSON.stringify(obj ?? {});
      } catch {
        return "{}";
      }
    };

    const base = process.env.SAMBANOVA_BASE_URL || "https://api.sambanova.ai/v1";
    const url = `${base.replace(/\/$/, "")}/chat/completions`;

    const prompt = `
You are a financial advisor AI.
Given the following user details:
- Income sources: ${safeStringify(incomes)}
- Expenses: ${safeStringify(expenses)}
- Goals: ${safeStringify(goals)}
- Current allocation plan: ${safeStringify(plan)}

Provide concise, actionable advice to improve savings, investments, and overall budget health.
`;

    const payload = {
      model: "DeepSeek-V3.1-Terminus",
      messages: [
        { role: "system", content: "You are a helpful and practical financial assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      top_p: 0.9,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`,
        "x-api-key": process.env.SAMBANOVA_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    const aiText =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.output ||
      "No summary generated";

    if (!res.ok) {
      return NextResponse.json({ error: aiText }, { status: res.status || 500 });
    }

    // ✅ Save AI summary as JSON (for jsonb column)
    const { error: insertError } = 
await supabase.from("ai_summaries").upsert(
  {
    user_id: userId,
    month,
    summary: { text: aiText },
    last_updated: new Date().toISOString(),
    last_data_change: new Date().toISOString(),
  },
  { onConflict: ["user_id", "month"] }
);

    if (insertError) throw insertError;

    console.log("✅ Summary saved for", { userId, month });
    return NextResponse.json({ summary: aiText });
  } catch (err) {
    console.error("💥 Error in POST /api/ai-summary:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
