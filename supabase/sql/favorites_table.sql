-- ============================================================================
-- Favorites table: per-user bookmarking of files and folders
-- ============================================================================

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  resource_type text not null check (resource_type in ('file', 'folder')),
  resource_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, resource_type, resource_id)
);

create index if not exists idx_favorites_user_workspace
  on public.favorites(user_id, workspace_id);

create index if not exists idx_favorites_resource
  on public.favorites(resource_type, resource_id);

-- Row-level security: a user only sees/modifies their own favorites.
alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites for select
  using (user_id = auth.uid());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites for insert
  with check (user_id = auth.uid());

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites for delete
  using (user_id = auth.uid());
