"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function YearlySummary({ data }) {
  if (!data) return <div>Loading yearly summary...</div>;

  const currentYear = new Date().getFullYear();

  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const monthEntries =
      data.incomes?.filter((entry) =>
        entry.month.startsWith(`${currentYear}-${month}`)
      ) || [];

    return {
      month: new Date(`${currentYear}-${month}-01`).toLocaleString("default", {
        month: "short",
      }),
      income: monthEntries.reduce(
        (sum, e) => sum + (e.type === "income" ? e.amount : 0),
        0
      ),
      expenses: monthEntries.reduce(
        (sum, e) => sum + (e.type === "expense" ? e.amount : 0),
        0
      ),
      savings: monthEntries.reduce(
        (sum, e) => sum + (e.type === "income" ? e.amount : -e.amount),
        0
      ),
    };
  });

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalSavings = totalIncome - totalExpenses;

  return (
    <div className="p-4 bg-white rounded-xl shadow-2xl border border-gray-100">
      {/* ✅ Top Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-inner">
          <div className="text-sm text-gray-600">Total Income</div>
          <div className="text-2xl font-extrabold text-green-700">
            ${totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-inner">
          <div className="text-sm text-gray-600">Total Expenses</div>
          <div className="text-2xl font-extrabold text-red-700">
            ${totalExpenses.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-inner">
          <div className="text-sm text-gray-600">Net Savings</div>
          <div className="text-2xl font-extrabold text-blue-700">
            ${totalSavings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 📊 Monthly Breakdown Chart */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Monthly Financial Breakdown
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Income" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[6, 6, 0, 0]} />
              <Bar dataKey="savings" fill="#3B82F6" name="Savings" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🎯 Yearly Goals Progress */}
      {data.goals?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Yearly Goals Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span className="truncate w-2/3">{goal.title}</span>
                  <span className="text-xs text-gray-600">
                    ${goal.current_amount} / ${goal.target_amount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        (goal.current_amount / goal.target_amount) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
