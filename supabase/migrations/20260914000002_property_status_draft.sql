-- Introduce an explicit `draft` status and retire the wizard's step columns.
--
-- The multi-step listing flow is replaced by a single form with a "Save draft" action, so
-- "draft" becomes a real status instead of something derived from `next_action`.

alter table public.properties drop constraint properties_status_check;
alter table public.properties add constraint properties_status_check
  check (status in ('draft', 'pending', 'review', 'active', 'inactive', 'rented'));

alter table public.properties alter column status set default 'draft';

-- Anything still mid-wizard is a draft.
update public.properties
   set status = 'draft'
 where status = 'pending'
   and next_action in ('basic_details', 'amenities', 'review');

-- A draft must be persistable while incomplete, so these become nullable. The existing
-- check constraints (monthly_rent > 0, the property_type / furnished_status enums) are
-- unaffected because a CHECK passes on NULL.
alter table public.properties
  alter column property_type    drop not null,
  alter column location         drop not null,
  alter column monthly_rent     drop not null,
  alter column furnished_status drop not null;

-- Completeness is enforced at the point a listing leaves draft, not on every write.
alter table public.properties add constraint properties_complete_when_not_draft
  check (
    status = 'draft'
    or (
      property_type is not null
      and location is not null
      and monthly_rent is not null
      and furnished_status is not null
    )
  );

-- The stepper is gone.
alter table public.properties drop column completed_steps;

alter table public.properties
  alter column next_action drop not null,
  alter column next_action drop default;

comment on column public.properties.next_action is
  'DEPRECATED - the stepper was removed; status=draft is the source of truth. Drop in a follow-up migration.';
