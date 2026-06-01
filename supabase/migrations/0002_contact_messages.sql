-- HailResume marketing: contact + "notify me" submissions.
-- Run in the Supabase SQL editor after 0001_init.sql.

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type       text not null default 'contact' check (type in ('contact', 'notify')),
  name       text,
  email      text not null,
  message    text,
  service    text,                       -- which coming-soon service (for 'notify')
  user_id    uuid references auth.users (id) on delete set null
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- Anyone (signed-in or anonymous visitor) may submit a message.
drop policy if exists contact_messages_insert_any on public.contact_messages;
create policy contact_messages_insert_any on public.contact_messages
  for insert with check (true);

-- Only admins can read the inbox.
drop policy if exists contact_messages_admin_read on public.contact_messages;
create policy contact_messages_admin_read on public.contact_messages
  for select using (public.is_admin());
