-- Profile pictures stay in a private bucket. The app serves them only after RLS
-- verifies ownership or profile publication. No direct anonymous object access.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('profile-pictures','profile-pictures',false,1048576,array['image/webp'])
on conflict (id) do nothing;
create policy "Owners upload profile pictures" on storage.objects for insert to authenticated
with check (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.profiles where owner_user_id = (select auth.uid()) and not is_sample));
create policy "Owners read profile picture objects" on storage.objects for select to authenticated
using (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners remove profile pictures" on storage.objects for delete to authenticated
using (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = (select auth.uid())::text);
grant select (avatar_url) on public.profiles to anon;
