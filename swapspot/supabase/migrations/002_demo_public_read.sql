-- DEMO ONLY: allow unauthenticated users to read all available listings and users
-- Remove this policy before going to production and re-enable community-scoped RLS

create policy "listings_select_public_demo"
  on listings for select
  using (status = 'available');

create policy "users_select_public_demo"
  on users for select
  using (true);
