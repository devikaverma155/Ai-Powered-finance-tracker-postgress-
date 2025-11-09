"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import MonthlyView from "./MonthlyView";
import AIRecommendations from "./AIRecommendations";
import YearlySummary from "./YearlySummary";
import GoalsList from "./GoalsList";
import GoalInput from "./GoalInput";

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState("yearly");
  const [yearlyData, setYearlyData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReady, setAiReady] = useState(false); // 🧠 to load AI in parallel

  if (!user) return null;

  // ✅ Fetch user goals
  async function fetchGoals() {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) return;

      const timeframeValue = view === "yearly" ? "yearly" : "monthly";
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("timeframe", timeframeValue);

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error("fetchGoals error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Fetch yearly data
  async function fetchYearlyData() {
    try {
      const year = new Date().getFullYear();
      const { data, error } = await supabase
        .from("monthly_tracking")
        .select("*")
        .eq("user_id", user.id)
        .gte("month", `${year}-01-01`)
        .lte("month", `${year}-12-31`);

      if (error) throw error;
      setYearlyData({ incomes: data });
      setAiReady(true); // ✅ Trigger AI only once data is ready
    } catch (err) {
      console.error("fetchYearlyData error:", err.message);
    }
  }

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchGoals();
    }
  }, [user, view]);

  useEffect(() => {
    if (user) fetchYearlyData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading goals...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ===== Header ===== */}
      <nav className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">
          Financial Dashboard
        </h1>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => setView("yearly")}
            className={`px-4 py-2 rounded transition ${
              view === "yearly"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Yearly Overview
          </button>

          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="yearly">Year {new Date().getFullYear()}</option>
            {Array.from({ length: 12 }, (_, i) => {
              const month = `${new Date().getFullYear()}-${String(
                i + 1
              ).padStart(2, "0")}`;
              return (
                <option key={month} value={month}>
                  {new Date(month).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              );
            })}
          </select>
        </div>
      </nav>

      {/* ===== Main Financial View ===== */}
      <div className="bg-white rounded-2xl shadow p-6">
        {view === "yearly" ? (
          <YearlySummary data={yearlyData} />
        ) : (
          <MonthlyView month={view} />
        )}
      </div>

      {/* ===== Goals & AI Section (Side by Side) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* 🎯 Goals Section */}
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Your Goals</h2>
          </div>

          <GoalInput
            defaultTimeframe={view === "yearly" ? "yearly" : "monthly"}
            month={view}
            onGoalAdded={fetchGoals}
          />

          {/* compact list style */}
          <div className="mt-3 space-y-2 max-h-[380px] overflow-y-auto pr-2">
            <GoalsList goals={goals} showProgress compact />
          </div>
        </div>

        {/* 🤖 AI Recommendations (loads in parallel) */}
        {aiReady && (
          <AIRecommendations
  userId={user?.id}
  month={view === "yearly" ? null : view}
  year={view === "yearly" ? new Date().getFullYear() : undefined}
  incomes={yearlyData?.incomes || []}
  expenses={yearlyData?.expenses || []}
  plan={{ savings_rate: "10%" }}
  goals={goals}
/>

        )}
      </div>
    </div>
  );
}
