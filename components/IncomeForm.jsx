"use client";
import { useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

export default function IncomeForm({ month, onSave }) {
  const { user } = useAuth();
  const [local, setLocal] = useState([{ source: "", amount: "" }]);
  const [loading, setLoading] = useState(false);

  // Load existing incomes for the month
  useEffect(() => {
    async function loadIncomes() {
      if (!user || !month) return;
      const { data } = await supabase
        .from('monthly_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('type', 'income');
      if (data?.length) {
        setLocal(data.map(d => ({ source: d.source, amount: d.amount.toString() })));
      }
    }
    loadIncomes();
  }, [user, month]);

  function update(idx, key, value) {
    const next = local.map((r, i) => (i === idx ? { ...r, [key]: value } : r));
    setLocal(next);
  }

  function addRow() {
    setLocal([...local, { source: "", amount: "" }]);
  }

  function removeRow(idx) {
    setLocal(local.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !month || !local.some(r => r.source && r.amount)) return;
    setLoading(true);
    try {
      // Delete existing entries for this month
      await supabase
        .from('monthly_tracking')
        .delete()
        .match({ 
          user_id: user.id, 
          month: month,
          type: 'income'
        });

      // Insert new entries
      const entries = local
        .filter(row => row.source && row.amount)
        .map(row => ({
          user_id: user.id,
          month: month,
          type: 'income',
          source: row.source,
          amount: Number(row.amount) || 0
        }));

      const { error } = await supabase
        .from('monthly_tracking')
        .insert(entries);

      if (!error) {
        onSave?.();
      } else {
        console.error('Error saving incomes:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-medium mb-2">Income</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        {local.map((row, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              className="flex-1 border px-2 py-1 rounded"
              placeholder="Source (salary, freelance)"
              value={row.source}
              onChange={(e) => update(idx, "source", e.target.value)}
            />
            <input
              className="w-32 border px-2 py-1 rounded"
              placeholder="Amount"
              value={row.amount}
              onChange={(e) => update(idx, "amount", e.target.value)}
            />
            <button type="button" className="text-red-500" onClick={() => removeRow(idx)}>Del</button>
          </div>
        ))}
        <button 
          type="button"
          onClick={addRow} 
          className="text-sm text-blue-600 mt-2"
        >
          + Add Another Income
        </button>
        <div className="flex justify-end mt-4">
          <button 
            type="submit" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Income'}
          </button>
        </div>
      </form>
    </div>
  );
}
