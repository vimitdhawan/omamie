create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'tenant' check (role in ('agent', 'owner', 'tenant')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Grant permissions to authenticated and service role
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

-- RLS Policy: Users can only see their own profile
create policy "users_select_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

-- RLS Policy: Users can only update their own profile
create policy "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS Policy: Users can only insert their own profile
create policy "users_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger function to auto-create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
