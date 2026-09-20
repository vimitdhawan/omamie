-- Tenants now share their desired move-in date and stay duration when expressing interest
-- in a property, so the owner sees intent up front instead of only "interested".
alter table public.property_matches
  add column requested_move_in_date date,
  add column requested_move_out_date date;

alter table public.property_matches
  add constraint property_matches_stay_dates_order
  check (
    requested_move_in_date is null
    or requested_move_out_date is null
    or requested_move_out_date > requested_move_in_date
  );
