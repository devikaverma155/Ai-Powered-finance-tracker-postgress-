"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function MonthlyTracking({ userId, goalId }) {
  const [tracking, setTracking] = useState({
    month: new Date().toISOString().slice(0, 7),
    amount: "",
  });

  async function addMonthlyAmount(e) {
    e.preventDefault();
    const { data, error } = await supabase
      .from('monthly_tracking')
      .insert([{
        user_id: userId,
        goal_id: goalId,
        month: new Date(tracking.month + "-01"),
        amount: parseFloat(tracking.amount)
      }]);

    if (!error) {
      setTracking({ ...tracking, amount: "" });
    }
  }

  return (
    <form onSubmit={addMonthlyAmount} className="space-y-4">
      <div className="flex gap-4">
        <input
          type="month"
          className="flex-1 border px-3 py-2 rounded"
          value={tracking.month}
          onChange={(e) => setTracking({...tracking, month: e.target.value})}
        />
        <input
          type="number"
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Amount achieved"
          value={tracking.amount}
          onChange={(e) => setTracking({...tracking, amount: e.target.value})}
        />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Track Progress
        </button>
      </div>
    </form>
  );
}
