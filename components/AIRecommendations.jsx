"use client";
import { useState, useEffect } from "react";

export default function AIRecommendations({ userId, month, incomes, expenses, plan, goals }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Load existing summary first (GET /api/ai-summary)
  useEffect(() => {
    async function loadExistingSummary() {
      if (!userId || !month) return;
      try {
        console.log("🔍 Fetching existing summary for", { userId, month });
        const res = await fetch(`/api/ai-summary?userId=${userId}&month=${month}`);
        if (!res.ok) {
          console.warn("❌ Failed to fetch summary:", res.status);
          return;
        }
        const data = await res.json();
        console.log("📦 Existing summary:", data);
        if (data.summary) setSummary(data.summary.text || data.summary);
      } catch (e) {
        console.warn("⚠️ No existing summary:", e);
      }
    }
    loadExistingSummary();
  }, [userId, month]);

  // ✅ Generate new summary (POST /api/ai-plan)
  async function generateAISummary() {
    setLoading(true);
    setError(null);
    try {
      console.log("⚙️ Generating new AI summary for", { userId, month });
      const res = await fetch("/api/ai-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, month, incomes, expenses, plan, goals }),
      });

      const text = await res.text();
      console.log("📩 Raw response text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON returned from /api/ai-plan");
      }

      if (!res.ok) throw new Error(data?.error || "AI generation failed");
      console.log("✅ AI Summary generated:", data);
      setSummary(data.summary || data.aiText);
    } catch (e) {
      console.error("💥 AI generation error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-semibold mb-2">AI Recommendations</h2>

      <button
        className="px-3 py-1 bg-blue-600 text-white rounded mb-3"
        onClick={generateAISummary}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate AI Plan"}
      </button>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {summary ? (
        <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-gray-800">
          {typeof summary === "string" ? summary : JSON.stringify(summary, null, 2)}
        </pre>
      ) : (
        !loading && <div className="text-gray-500 text-sm">No insights yet.</div>
      )}
    </div>
  );
}
