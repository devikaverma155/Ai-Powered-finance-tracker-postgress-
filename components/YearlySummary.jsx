"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function YearlySummary({ data }) {
  if (!data) return <div>Loading yearly summary...</div>;

  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    const monthEntries = data.incomes?.filter(entry => 
      entry.month.startsWith(`${new Date().getFullYear()}-${month}`)
    ) || [];

    return {
      month: new Date(`2024-${month}-01`).toLocaleString('default', { month: 'short' }),
      income: monthEntries.reduce((sum, e) => sum + (e.type === 'income' ? e.amount : 0), 0),
      expenses: monthEntries.reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : 0), 0),
      savings: monthEntries.reduce((sum, e) => 
        sum + (e.type === 'income' ? e.amount : -e.amount), 0
      )
    };
  });

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalSavings = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Income</div>
          <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Net Savings</div>
          <div className="text-2xl font-bold text-blue-600">${totalSavings.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Bar dataKey="savings" fill="#3B82F6" name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.goals?.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Yearly Goals Progress</h3>
          {data.goals.map(goal => (
            <div key={goal.id} className="mb-4">
              <div className="flex justify-between mb-1">
                <span>{goal.title}</span>
                <span>${goal.current_amount} / ${goal.target_amount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(goal.current_amount / goal.target_amount * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
