"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import MonthlyTracking from "./MonthlyTracking";
import GoalProgress from "./GoalProgress";

export default function GoalInput({ onGoalAdded, month, defaultTimeframe = "monthly" }) {
  const { user } = useAuth();
  const [goal, setGoal] = useState({
    title: "",
    targetAmount: "",
    timeframe: defaultTimeframe,
    deadline: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validateFields() {
    const newErrors = {};

    if (!goal.title.trim()) newErrors.title = "Goal title is required.";
    if (!goal.targetAmount.trim()) newErrors.targetAmount = "Target amount is required.";
    if (!goal.timeframe.trim()) newErrors.timeframe = "Please select a timeframe.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function addGoal(e) {
    e.preventDefault();
    if (!user) return;

    if (!validateFields()) return;

    setLoading(true);

    // ✅ Normalize month (ensure YYYY-MM-01 format)
    const normalizedMonth =
      month?.length === 7 ? `${month}-01` : month || new Date().toISOString().slice(0, 10);

    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([
          {
            user_id: user.id,
            title: goal.title.trim(),
            target_amount: parseFloat(goal.targetAmount),
            timeframe: goal.timeframe,
            deadline: goal.deadline || null,
            month: normalizedMonth, // ✅ include month in insert
            current_amount: 0
          }
        ])
        .select();

      if (error) throw error;

      // ✅ Success
      setGoal({
        title: "",
        targetAmount: "",
        timeframe: defaultTimeframe,
        deadline: ""
      });
      setErrors({});
      onGoalAdded?.(data);
    } catch (err) {
      console.error("❌ Error adding goal:", err.message);
      setErrors({ submit: "Something went wrong while adding your goal. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-6">
      <h2 className="font-medium mb-4">Add Financial Goal</h2>
      <form onSubmit={addGoal} className="space-y-4">
        {errors.submit && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
            {errors.submit}
          </div>
        )}

        {/* Title Input */}
        <div>
          <input
            className={`w-full border px-3 py-2 rounded ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Goal title (e.g., Emergency Fund)"
            value={goal.title}
            onChange={(e) => setGoal({ ...goal, title: e.target.value })}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Target Amount & Timeframe */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              className={`w-full border px-3 py-2 rounded ${
                errors.targetAmount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Target Amount ($)"
              value={goal.targetAmount}
              onChange={(e) => setGoal({ ...goal, targetAmount: e.target.value })}
            />
            {errors.targetAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.targetAmount}</p>
            )}
          </div>

          <div>
            <select
              value={goal.timeframe}
              onChange={(e) => setGoal({ ...goal, timeframe: e.target.value })}
              className={`border px-3 py-2 rounded ${
                errors.timeframe ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
            </select>
            {errors.timeframe && (
              <p className="text-red-500 text-sm mt-1">{errors.timeframe}</p>
            )}
          </div>
        </div>

        {/* Deadline (optional) */}
        <div>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded border-gray-300"
            value={goal.deadline}
            onChange={(e) => setGoal({ ...goal, deadline: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">(Deadline is optional)</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 text-white rounded transition ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Adding..." : "Add Goal"}
        </button>
      </form>

      {/* Only show tracking if goal ID exists */}
      {goal.id && (
        <>
          <MonthlyTracking userId={user.id} goalId={goal.id} />
          <GoalProgress userId={user.id} goal={goal} />
        </>
      )}
    </div>
  );
}
