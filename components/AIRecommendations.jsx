"use client";
import { useState, useEffect } from "react";

export default function AIRecommendations({ userId, month, incomes, expenses, plan, goals }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [outdated, setOutdated] = useState(false); // ✅ new state for warning

  // ✅ Load existing summary and check if outdated
  useEffect(() => {
    async function loadExistingSummary() {
      if (!userId || !month) return;
      try {
        const res = await fetch(`/api/ai-summary?userId=${userId}&month=${month}`);
        const data = await res.json();

        if (res.ok && data.summary) {
          setSummary(data.summary.text || data.summary); // works with both JSON/text
          // Compare timestamps if available
          if (data.last_data_change && data.last_updated) {
            const lastChange = new Date(data.last_data_change);
            const lastUpdate = new Date(data.last_updated);
            if (lastChange > lastUpdate) {
              setOutdated(true); // mark summary as outdated
            }
          }
        }
      } catch (e) {
        console.warn("No existing summary or failed to fetch:", e);
      }
    }
    loadExistingSummary();
  }, [userId, month]);

  // ✅ Regenerate AI Summary
  async function generateAISummary() {
    setLoading(true);
    setError(null);
    setOutdated(false);

    try {
      const res = await fetch("/api/ai-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, month, incomes, expenses, plan, goals }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI generation failed");

      setSummary(data.aiText);
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

      {/* ⚠️ Outdated warning banner */}
      {outdated && (
        <div className="p-2 mb-3 text-sm bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          ⚠️ Your data has changed since the last AI summary. Please regenerate to get updated insights.
        </div>
      )}

      {/* Generate Button */}
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded mb-3"
        onClick={generateAISummary}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate AI Plan"}
      </button>

      {/* Error Message */}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Summary Display */}
      {summary ? (
        <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-gray-800">{summary}</pre>
      ) : (
        !loading && <div className="text-gray-500 text-sm">No insights yet.</div>
      )}
    </div>
  );
}
