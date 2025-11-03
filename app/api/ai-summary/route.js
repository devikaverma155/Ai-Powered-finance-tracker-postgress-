import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const month = searchParams.get("month");

    console.log("📥 GET /api/ai-summary", { userId, month });

    if (!userId || !month) {
      return NextResponse.json(
        { error: "Missing userId or month parameter" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ai_summaries")
      .select("summary")
      .eq("user_id", userId)
      .eq("month", month)
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      console.log("ℹ️ No summary found for this user/month");
      return NextResponse.json({ summary: null });
    }

    console.log("✅ Summary retrieved successfully:", data.summary);
    return NextResponse.json({ summary: data.summary });
  } catch (err) {
    console.error("💥 Unexpected error in GET /api/ai-summary:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
