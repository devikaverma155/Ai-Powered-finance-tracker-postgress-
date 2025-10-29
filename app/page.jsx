"use client";
import { useAuth } from '../lib/auth-context';
import Auth from '../components/Auth';
import Dashboard from '../components/Dashboard';
import { useEffect, useState } from "react";
import IncomeForm from "../components/IncomeForm";
import ExpenseForm from "../components/ExpenseForm";
import GoalInput from "../components/GoalInput";
import AIRecommendations from "../components/AIRecommendations";

export default function Page() {
  const { user } = useAuth();

  if (user) {
    return <Dashboard />;
  }

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [plan, setPlan] = useState({ savings_rate: "10%" });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("finance_data") || "{}");
      if (saved.incomes) setIncomes(saved.incomes);
      if (saved.expenses) setExpenses(saved.expenses);
      if (saved.goals) setGoals(saved.goals);
      if (saved.plan) setPlan(saved.plan);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "finance_data",
      JSON.stringify({ incomes, expenses, goals, plan })
    );
  }, [incomes, expenses, goals, plan]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Personal Finance Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track your expenses, set smart goals, and get AI-powered recommendations
            to improve your financial health.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => document.getElementById('auth-modal').showModal()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Smart Goal Tracking</h3>
            <p>Set and track financial goals with AI-powered insights</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Monthly Analytics</h3>
            <p>Visualize your spending patterns and progress</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
            <p>Get personalized advice to optimize your finances</p>
          </div>
        </div>

        <dialog id="auth-modal" className="rounded-lg p-0">
          <Auth />
        </dialog>
      </div>
    </div>
  );
}
