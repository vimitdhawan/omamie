-- Contact messages were insert-only with no way for admins to read or act on them. Adds a
-- resolution workflow: an admin marks a message completed with a required note once they've
-- reached out to the customer off-platform. Completion is one-way (no reopen), enforced in
-- the repository by only updating rows still in 'open' status.

alter table public.contact_messages
  add column status text not null default 'open'
    check (status in ('open', 'completed')),
  add column resolution_note text,
  add column resolved_at timestamptz,
  add column resolved_by uuid references public.profiles(id) on delete set null;

create index idx_contact_messages_status_created_at
  on public.contact_messages (status, created_at desc);
