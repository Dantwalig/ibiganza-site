create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  organization text,
  email text not null,
  phone text,
  interest text not null,
  message text not null
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- Only the server (service role key) reads and writes this table.
alter table public.inquiries enable row level security;
