import React from 'react';
import GoalProgress from './GoalProgress';

export default function GoalsList({ goals, showProgress }) {
  if (!goals || goals.length === 0) {
    return <div>No goals available.</div>;
  }

  return (
    <div className="space-y-4">
      {goals.map(goal => (
        <div key={goal.id} className="border-b pb-4">
          <div className="flex justify-between mb-2">
            <h4 className="font-medium">{goal.title}</h4>
            <span className="text-gray-600">
              ${goal.current_amount || 0} / ${goal.target_amount}
            </span>
          </div>
          {showProgress && (
            <GoalProgress userId={goal.user_id} goal={goal} />
          )}
        </div>
      ))}
    </div>
  );
}
