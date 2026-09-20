-- OAuth signups (e.g. Google) don't carry a `role` in raw_user_meta_data the way
-- password signUp does, so the previous trigger inserted an explicit NULL for
-- role, which violates the NOT NULL constraint on public.profiles.role and
-- aborted the auth.users insert. Default to 'tenant' when role is absent; the
-- auth callback route updates it afterwards for agent/owner OAuth signups.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'tenant')
  );
  return new;
end;
$$ language plpgsql security definer;
