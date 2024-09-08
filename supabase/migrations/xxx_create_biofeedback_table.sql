create table biofeedback (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  data jsonb not null,
  created_at timestamp with time zone default now()
);

-- Create an index on the user_id for faster queries
create index biofeedback_user_id_idx on biofeedback(user_id);

-- Enable row level security
alter table biofeedback enable row level security;

-- Create a policy that allows insert only for authenticated users
create policy "Users can insert their own biofeedback data"
  on biofeedback for insert
  with check (auth.uid() = user_id);

-- Create a policy that allows select for all (public dashboard)
create policy "Anyone can view biofeedback data"
  on biofeedback for select
  using (true);