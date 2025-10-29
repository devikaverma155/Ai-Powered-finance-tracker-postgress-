"use client";
import { useState } from "react";

export default function AIRecommendations({ incomes, expenses, plan, goals }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function fetchPlan() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incomes, expenses, plan, goals })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "API error");
      setResult(data.aiText || "No recommendations returned.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-medium mb-2">AI Recommendations</h2>
      <button
        className="px-3 py-1 bg-green-600 text-white rounded mb-3"
        onClick={fetchPlan}
        disabled={loading}
      >
        {loading ? "Thinking..." : "Get AI Plan"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {result && <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded">{result}</pre>}
      {!result && !error && <div className="text-sm text-gray-500">No recommendations yet.</div>}
    </div>
  );
}
