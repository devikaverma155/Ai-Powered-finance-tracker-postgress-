"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import IncomeForm from './IncomeForm';
import ExpenseForm from './ExpenseForm';
import GoalInput from './GoalInput';
import GoalsList from './GoalsList';

export default function MonthlyView({ month }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [goalProgress, setGoalProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Ensure month is always "YYYY-MM-01"
  const normalizedMonth = month?.length === 7 ? `${month}-01` : month;

  async function fetchMonthData() {
    if (!user || !normalizedMonth) return;

    try {
      // ✅ Fetch income/expense entries
      const { data: entries, error: entriesError } = await supabase
        .from('monthly_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', normalizedMonth);

      if (entriesError) throw entriesError;

      // ✅ Fetch monthly goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('timeframe', 'monthly')
        .eq('month', normalizedMonth);

      if (goalsError) throw goalsError;

      // ✅ Fetch goal progress
      const { data: progress, error: progressError } = await supabase
        .from('monthly_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', normalizedMonth)
        .not('goal_id', 'is', null);

      if (progressError) throw progressError;

      setData({ entries: entries || [], goals: goals || [] });
      setGoalProgress(progress || []);
    } catch (error) {
      console.error("❌ Error fetching monthly data:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMonthData();
  }, [user, normalizedMonth]);

  const monthName = new Date(normalizedMonth).toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  const totals = data?.entries?.reduce(
    (acc, entry) => {
      if (entry.type === 'income') acc.income += entry.amount;
      if (entry.type === 'expense') acc.expenses += entry.amount;
      return acc;
    },
    { income: 0, expenses: 0 }
  ) || { income: 0, expenses: 0 };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{monthName}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <IncomeForm 
            month={normalizedMonth} 
            onSave={fetchMonthData} 
          />
          <ExpenseForm 
            month={normalizedMonth} 
            onSave={fetchMonthData}
          />
          <GoalInput 
            defaultTimeframe="monthly" 
            month={normalizedMonth} 
            onGoalAdded={fetchMonthData}
          />
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-medium mb-3">Monthly Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Income</div>
                <div className="text-lg font-semibold text-green-600">
                  ${totals.income.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Expenses</div>
                <div className="text-lg font-semibold text-red-600">
                  ${totals.expenses.toLocaleString()}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-600">Net Savings</div>
                <div className="text-lg font-semibold text-blue-600">
                  ${(totals.income - totals.expenses).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {!loading && data?.entries?.length > 0 && (
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium mb-3">Breakdown</h3>
              <div className="space-y-2">
                {data.entries.map((entry, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className={entry.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {entry.source}
                    </span>
                    <span>${entry.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && data?.goals?.length > 0 && (
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium mb-3">Monthly Goals Progress</h3>
              {data.goals.map(goal => {
                const tracked = goalProgress
                  .filter(p => p.goal_id === goal.id)
                  .reduce((sum, p) => sum + (p.amount || 0), 0);

                return (
                  <div key={goal.id} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span>{goal.title}</span>
                      <span>${tracked} / ${goal.target_amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(tracked / goal.target_amount * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Pass normalized month to GoalsList too */}
      <GoalsList timeframe="monthly" month={normalizedMonth} />
    </div>
  );
}
