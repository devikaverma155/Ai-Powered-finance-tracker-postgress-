"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function GoalProgress({ userId, goal }) {
const [amount, setAmount] = useState("");
const [withdraw, setWithdraw] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [currentAmount, setCurrentAmount] = useState(goal.current_amount || 0);
const [lastAction, setLastAction] = useState(null); // "add" or "withdraw"

// ✅ Add amount to goal
async function handleAddAmount(e) {
e.preventDefault();
if (!amount.trim()) return setError("Please enter an amount.");
const addAmount = parseFloat(amount);
if (isNaN(addAmount) || addAmount <= 0)
return setError("Please enter a valid positive number.");

setLoading(true);
const newAmount = currentAmount + addAmount;

const { data, error } = await supabase
  .from("goals")
  .update({ current_amount: newAmount })
  .eq("id", goal.id)
  .eq("user_id", userId)
  .select()
  .single();

setLoading(false);

if (error) {
  console.error("❌ Error updating goal:", error);
  setError("Something went wrong. Please try again.");
  return;
}

setError("");
setAmount("");
setCurrentAmount(data.current_amount);
setLastAction("add");

}

// 💸 Withdraw amount from goal
async function handleWithdraw(e) {
e.preventDefault();
if (!withdraw.trim()) return setError("Please enter an amount to withdraw.");
const withdrawAmount = parseFloat(withdraw);
if (isNaN(withdrawAmount) || withdrawAmount <= 0)
return setError("Please enter a valid positive number.");
if (withdrawAmount > currentAmount)
return setError("You cannot withdraw more than your saved amount.");

setLoading(true);
const newAmount = currentAmount - withdrawAmount;

const { data, error } = await supabase
  .from("goals")
  .update({ current_amount: newAmount })
  .eq("id", goal.id)
  .eq("user_id", userId)
  .select()
  .single();

setLoading(false);

if (error) {
  console.error("❌ Error updating goal:", error);
  setError("Something went wrong while withdrawing.");
  return;
}

setError("");
setWithdraw("");
setCurrentAmount(data.current_amount);
setLastAction("withdraw");


}

const percent = Math.min((currentAmount / goal.target_amount) * 100, 100);

// 🎯 Motivational messages
function getMotivation() {
if (lastAction === "withdraw") {
if (percent === 0) return "It’s okay to start again 💖 Every step counts!";
if (percent < 25) return "Tough times don’t last — you’ll bounce back 🌈";
if (percent < 50) return "Small dips are part of the journey 💪";
if (percent < 75) return "Stay strong — you’re still doing great ✨";
return "You’ve come so far! A tiny step back won’t stop you 🌻";
}
// Default for add / neutral
if (percent === 0) return "Every big dream starts with a single step 💪";
if (percent < 25) return "Great start! Keep the momentum going 🚀";
if (percent < 50) return "You’re halfway to glory! 💫";
if (percent < 75) return "You’re crushing it! Almost there 🔥";
if (percent < 100) return "Wow! You’re so close to victory 🏁";
return "GOAL ACHIEVED! 🎉 Treat yourself, you earned it! 💰";

}

return ( <div className="bg-white p-4 rounded shadow space-y-4 transition-all"> <div className="flex justify-between text-sm font-medium"> <span>
Progress: ${currentAmount.toLocaleString()} / $
{goal.target_amount.toLocaleString()} </span> <span>{percent.toFixed(1)}%</span> </div>

  {/* Progress Bar */}
  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      className={`h-3 transition-all duration-500 rounded-full ${
        percent < 50
          ? "bg-blue-500"
          : percent < 75
          ? "bg-green-500"
          : percent < 100
          ? "bg-yellow-500"
          : "bg-purple-600"
      }`}
      style={{ width: `${percent}%` }}
    ></div>
  </div>

  {/* Fun Comment */}
  <p
    className={`text-sm font-medium text-center mt-2 ${
      lastAction === "withdraw"
        ? "text-red-600"
        : percent < 50
        ? "text-blue-600"
        : percent < 75
        ? "text-green-600"
        : percent < 100
        ? "text-yellow-600"
        : "text-purple-700"
    }`}
  >
    {getMotivation()}
  </p>

  {/* Add Amount Form */}
  <form onSubmit={handleAddAmount} className="flex gap-2 mt-3">
    <input
      type="number"
      placeholder="Add amount ($)"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      className="border px-3 py-2 rounded flex-1"
    />
    <button
      type="submit"
      disabled={loading}
      className={`px-4 py-2 text-white rounded transition ${
        loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? "Processing..." : "Add"}
    </button>
  </form>

  {/* Withdraw Amount Form */}
  <form onSubmit={handleWithdraw} className="flex gap-2 mt-3">
    <input
      type="number"
      placeholder="Withdraw amount ($)"
      value={withdraw}
      onChange={(e) => setWithdraw(e.target.value)}
      className="border px-3 py-2 rounded flex-1"
    />
    <button
      type="submit"
      disabled={loading}
      className={`px-4 py-2 text-white rounded transition ${
        loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
      }`}
    >
      {loading ? "Processing..." : "Withdraw"}
    </button>
  </form>

  {error && <p className="text-red-500 text-sm mt-1 text-center">{error}</p>}
</div>

);
}
