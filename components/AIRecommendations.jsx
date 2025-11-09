"use client";
import { useState, useEffect, useMemo } from "react";

const parseAISummary = (rawText) => {
  if (!rawText) return [];

  const lines = rawText
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const parsed = [];
  let currentSection = { title: "Summary Overview", content: [] };
  const titleRegex = /^(?:##\s*|\*\*)([^*#]+?)(?:\*\*|(?:\s*:)?)$/i;

  for (const line of lines) {
    const match = line.match(titleRegex);
    if (match) {
      if (currentSection.title && currentSection.content.length > 0) {
        parsed.push(currentSection);
      }
      currentSection = {
        title: match[1].trim().replace(/\*\*|:$/g, "").trim(),
        content: [],
      };
    } else {
      const contentLine = line
        .replace(
          /^[0-9.]+\s*|\-\s*|^(Based on your financial data, here are key recommendations to improve your financial health:)/i,
          ""
        )
        .trim();

      if (contentLine) currentSection.content.push(contentLine);
    }
  }

  if (currentSection.title && currentSection.content.length > 0)
    parsed.push(currentSection);
  if (
    parsed.length > 0 &&
    parsed[0].title === "Summary Overview" &&
    parsed[0].content.every((c) => !c.trim())
  ) {
    parsed.shift();
  }

  return parsed;
};

export default function AIRecommendations({
  userId,
  month,
  year,
  incomes,
  expenses,
  plan,
  goals,
}) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [outdated, setOutdated] = useState(false);

  const isDataReady = userId && (month || year);

  // 🧠 Log basic props and state
  useEffect(() => {
    console.log("🧠 AIRecommendations Mounted", {
      userId,
      month,
      year,
      hasIncomes: incomes?.length > 0,
      hasExpenses: expenses?.length > 0,
      goalsCount: goals?.length || 0,
    });
  }, [userId, month, year, incomes, expenses, goals]);

  useEffect(() => {
    async function loadExistingSummary() {
      if (!userId || (!month && !year)) return;
      try {
        const query = month
          ? `/api/ai-summary?userId=${userId}&month=${month}`
          : `/api/ai-summary?userId=${userId}&year=${year}`;

        console.log("📥 Fetching existing summary from:", query);

        const res = await fetch(query);
        const data = await res.json();

        console.log("📦 Received from /api/ai-summary:", data);

        const summaryText = data.summary?.text || data.summary;
        if (res.ok && summaryText) {
          console.log("✅ Existing summary found. Setting state...");
          setSummary(summaryText);

          if (data.last_data_change && data.last_updated) {
            const lastChange = new Date(data.last_data_change);
            const lastUpdate = new Date(data.last_updated);
            console.log("🕒 Comparing timestamps", {
              lastChange,
              lastUpdate,
            });
            if (lastChange > lastUpdate) {
              console.warn("⚠️ Data is newer than summary → Marking as outdated");
              setOutdated(true);
            }
          }
        } else {
          console.warn("ℹ️ No summary text found for this period.");
        }
      } catch (e) {
        console.error("💥 Error fetching existing summary:", e);
      }
    }

    if (isDataReady) loadExistingSummary();
  }, [userId, month, year, isDataReady]);

  async function generateAISummary() {
    if (!isDataReady) {
      const msg = "Missing user ID or month/year. Cannot generate plan.";
      console.error("🚫", msg);
      setError(msg);
      return;
    }

    setLoading(true);
    setError(null);
    setOutdated(false);

    console.log("🚀 Sending data to /api/ai-plan", {
      userId,
      month,
      year,
      incomes: incomes?.length,
      expenses: expenses?.length,
      plan,
      goalsCount: goals?.length,
    });

    try {
      const res = await fetch("/api/ai-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          month,
          year,
          incomes,
          expenses,
          plan,
          goals,
        }),
      });

      const data = await res.json();
      console.log("📤 Response from /api/ai-plan:", data);

      if (!res.ok) throw new Error(data?.error || "AI generation failed");

      setSummary(data.summary || data.aiText);
      console.log("✅ Summary updated successfully.");
    } catch (e) {
      console.error("💥 AI generation error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const parsedSummary = useMemo(() => {
    console.log("🧩 Parsing summary text...", summary?.slice(0, 200) || "empty");
    return parseAISummary(summary);
  }, [summary]);

  const title = year
    ? `📅 AI Financial Summary for ${year}`
    : `✨ AI Financial Recommendations for ${month}`;

  return (
    <div className="p-4 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        {title}
      </h2>

      {/* ⚠️ Outdated Warning Banner */}
      {isDataReady && outdated && (
        <div className="p-3 mb-4 text-sm bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg flex justify-between items-center">
          <span>
            ⚠️ Your data has changed. Please regenerate for updated insights.
          </span>
          <button
            className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            onClick={generateAISummary}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Now"}
          </button>
        </div>
      )}

      {/* Primary Button */}
      {isDataReady ? (
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition mb-4"
          onClick={generateAISummary}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : summary
            ? "Regenerate Summary"
            : "Generate Summary"}
        </button>
      ) : (
        <div className="text-gray-500 text-sm mb-4">
          Awaiting user ID and period data...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 mb-4 text-red-500 bg-red-50 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Structured Display */}
      {parsedSummary.length > 0 ? (
        <div className="space-y-6">
          {parsedSummary.map((section, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="text-lg font-semibold text-blue-700 mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.content.map((point, i) => (
                  <li key={i} className="flex items-start text-gray-700">
                    <span className="flex-shrink-0 mr-3 text-green-500 font-bold text-lg leading-none">
                      •
                    </span>
                    <p className="flex-1">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: point
                            .replace(
                              /(\*\*[^*]+\*\*)/g,
                              '<span class="font-bold text-gray-900">$1</span>'
                            )
                            .replace(/\*\*/g, ""),
                        }}
                      />
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        isDataReady &&
        !loading && (
          <div className="text-gray-500 text-center py-8">
            No financial insights available yet. Click "Generate Summary" to
            start!
          </div>
        )
      )}
    </div>
  );
}
