"use client";
import { useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

export default function ExpenseForm({ month, onSave }) {
  const { user } = useAuth();
  const [local, setLocal] = useState([{ name: "", amount: "" }]);
  const [loading, setLoading] = useState(false);

  // Load existing expenses for the month
  useEffect(() => {
    async function loadExpenses() {
      if (!user || !month) return;
      const { data } = await supabase
        .from('monthly_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('type', 'expense');
      
      if (data?.length) {
        setLocal(data.map(d => ({ name: d.source, amount: d.amount.toString() })));
      }
    }
    loadExpenses();
  }, [user, month]);

  function update(idx, key, value) {
    const next = local.map((r, i) => (i === idx ? { ...r, [key]: value } : r));
    setLocal(next);
    if (typeof setExpenses === "function") {
      setExpenses(next.map(r => ({ name: r.name, amount: Number(r.amount) || 0 })));
    }
  }

  function addRow() {
    const next = [...local, { name: "", amount: "" }];
    setLocal(next);
    if (typeof setExpenses === "function") {
      setExpenses(next.map(r => ({ name: r.name, amount: Number(r.amount) || 0 })));
    }
  }

  function removeRow(idx) {
    const next = local.filter((_, i) => i !== idx);
    setLocal(next);
    if (typeof setExpenses === "function") {
      setExpenses(next.map(r => ({ name: r.name, amount: Number(r.amount) || 0 })));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !month || !local.some(r => r.name && r.amount)) return;
    
    setLoading(true);
    try {
      // Delete existing entries for this month
      await supabase
        .from('monthly_tracking')
        .delete()
        .match({ 
          user_id: user.id, 
          month: month,
          type: 'expense'
        });

      // Insert new entries
      const entries = local
        .filter(row => row.name && row.amount)
        .map(row => ({
          user_id: user.id,
          month: month,
          type: 'expense',
          source: row.name,
          amount: Number(row.amount) || 0
        }));

      const { error } = await supabase
        .from('monthly_tracking')
        .insert(entries);

      if (!error) {
        onSave?.();
      } else {
        console.error('Error saving expenses:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-medium mb-2">Expenses</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        {local.map((row, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              className="flex-1 border px-2 py-1 rounded"
              placeholder="Category (rent, groceries)"
              value={row.name}
              onChange={(e) => update(idx, "name", e.target.value)}
            />
            <input
              className="w-32 border px-2 py-1 rounded"
              placeholder="Amount"
              value={row.amount}
              onChange={(e) => update(idx, "amount", e.target.value)}
            />
            <button className="text-red-500" onClick={() => removeRow(idx)}>Del</button>
          </div>
        ))}
        <button 
          type="button"
          onClick={addRow} 
          className="text-sm text-blue-600 mt-2"
        >
          + Add Another Expense
        </button>
        <div className="flex justify-end mt-4">
          <button 
            type="submit" 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Expenses'}
          </button>
        </div>
      </form>
    </div>
  );
}
