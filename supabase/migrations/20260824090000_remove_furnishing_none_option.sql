update public.property_find_requests
  set furnishing = 'unfurnished'
  where furnishing = 'none';

alter table public.property_find_requests
  drop constraint if exists property_find_requests_furnishing_check;

alter table public.property_find_requests
  add constraint property_find_requests_furnishing_check
  check (furnishing in ('furnished','partially','unfurnished'));
