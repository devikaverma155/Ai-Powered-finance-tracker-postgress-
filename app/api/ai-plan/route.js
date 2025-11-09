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
    const { userId, month = null, year = null, incomes = [], expenses = [], plan = {}, goals = [] } = body;

    if (!userId || (!month && !year)) {
      return NextResponse.json({ error: "Missing userId or month/year" }, { status: 400 });
    }

    // ✅ Safe stringify helper (avoids circular reference errors)
    const safeStringify = (obj) => {
      try {
        return JSON.stringify(obj ?? {});
      } catch {
        return "{}";
      }
    };

    // ✅ Prepare AI Prompt
    const periodLabel = month ? `month ${month}` : `year ${year}`;
    const prompt = `
You are a financial advisor AI.
Analyze the user's financial performance for ${periodLabel}.
Given the following user details:
- Income sources: ${safeStringify(incomes)}
- Expenses: ${safeStringify(expenses)}
- Goals: ${safeStringify(goals)}
- Current plan: ${safeStringify(plan)}

Provide concise, actionable, and personalized financial insights.
For yearly summaries, include a brief overall performance analysis and improvement plan for the upcoming year.
    `;

    // ✅ Build request to SambaNova
    const base = process.env.SAMBANOVA_BASE_URL || "https://api.sambanova.ai/v1";
    const url = `${base.replace(/\/$/, "")}/chat/completions`;

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

    // ✅ Store summary (supports monthly OR yearly)
    const insertPayload = {
      user_id: userId,
      month: month || null,
      year: year || new Date().getFullYear(),
      summary: { text: aiText },
      last_updated: new Date().toISOString(),
      last_data_change: new Date().toISOString(),
    };

    const { error: insertError } =       await supabase
  .from("ai_summaries")
  .upsert(
    {
      user_id: userId,
      month: month || null,
      year: year || null,
      summary: aiText,
      last_updated: new Date().toISOString(),
    },
   { onConflict: "user_id,month,year" }
  );
    if (insertError) throw insertError;

    console.log("✅ AI summary saved for", { userId, month, year });
    return NextResponse.json({ summary: aiText });
  } catch (err) {
    console.error("💥 Error in POST /api/ai-summary:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
