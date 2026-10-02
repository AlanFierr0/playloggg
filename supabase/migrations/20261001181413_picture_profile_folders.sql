-- Public picture paths use the public profile ID, never the private Auth user ID.
drop policy "Owners upload profile pictures" on storage.objects;
drop policy "Owners read profile picture objects" on storage.objects;
drop policy "Owners remove profile pictures" on storage.objects;
create policy "Owners upload profile pictures" on storage.objects for insert to authenticated
with check (bucket_id = 'profile-pictures' and exists (
 select 1 from public.profiles where id::text = (storage.foldername(name))[1]
 and owner_user_id = (select auth.uid()) and not is_sample));
create policy "Owners read profile picture objects" on storage.objects for select to authenticated
using (bucket_id = 'profile-pictures' and exists (
 select 1 from public.profiles where id::text = (storage.foldername(name))[1]
 and owner_user_id = (select auth.uid()) and not is_sample));
create policy "Owners remove profile pictures" on storage.objects for delete to authenticated
using (bucket_id = 'profile-pictures' and exists (
 select 1 from public.profiles where id::text = (storage.foldername(name))[1]
 and owner_user_id = (select auth.uid()) and not is_sample));
