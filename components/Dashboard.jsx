"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import MonthlyView from "./MonthlyView";
import YearlySummary from "./YearlySummary";
import GoalsList from "./GoalsList";
import GoalInput from "./GoalInput";

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState("yearly");
  const [yearlyData, setYearlyData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ new state

  // ✅ Prevent rendering until user is loaded
  if (!user) return null;

  // Fetch user goals safely
  async function fetchGoals() {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Auth session error:", sessionError);
        throw sessionError;
      }

      if (!session?.user) {
        console.warn("No authenticated user session yet");
        return;
      }

      const userId = session.user.id;
      const timeframeValue = view === "yearly" ? "yearly" : "monthly";

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .eq("timeframe", timeframeValue);

      if (error) throw error;

      setGoals(data || []);
    } catch (err) {
      console.error("fetchGoals error:", err.message);
      alert("Failed to load goals. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch yearly income data
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
    <div className="space-y-6">
      <nav className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setView("yearly")}
            className={`px-4 py-2 rounded ${
              view === "yearly" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Yearly Overview
          </button>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="border rounded px-3"
          >
            <option value="yearly">Year {new Date().getFullYear()}</option>
            {Array.from({ length: 12 }, (_, i) => {
              const month = `${new Date().getFullYear()}-${String(i + 1).padStart(2, "0")}`;
              return (
                <option key={month} value={month}>
                  {new Date(month).toLocaleString("default", { month: "long" })}
                </option>
              );
            })}
          </select>
        </div>
      </nav>

      {view === "yearly" ? (
        <YearlySummary data={yearlyData} />
      ) : (
        <MonthlyView month={view} />
      )}

      {/* ✅ Single instance of GoalInput */}
      <GoalInput
        defaultTimeframe={view === "yearly" ? "yearly" : "monthly"}
        month={view}
        onGoalAdded={fetchGoals}
      />

      <GoalsList goals={goals} showProgress />
    </div>
  );
}
