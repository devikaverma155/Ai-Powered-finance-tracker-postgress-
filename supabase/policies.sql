-- Enable RLS
alter table goals enable row level security;
alter table monthly_tracking enable row level security;

-- Goals policies
create policy "Users can create their own goals"
on goals for insert
with check (auth.uid() = user_id);

create policy "Users can view their own goals"
on goals for select
using (auth.uid() = user_id);

create policy "Users can update their own goals"
on goals for update
using (auth.uid() = user_id);

-- Monthly tracking policies
create policy "Users can create their own tracking entries"
on monthly_tracking for insert
with check (auth.uid() = user_id);

create policy "Users can view their own tracking entries"
on monthly_tracking for select
using (auth.uid() = user_id);

create policy "Users can update their own tracking entries"
on monthly_tracking for update
using (auth.uid() = user_id);
