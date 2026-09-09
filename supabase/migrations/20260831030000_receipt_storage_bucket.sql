-- F6-2 영수증 이미지 업로드용 Storage 버킷 + RLS.
-- 오브젝트 경로 컨벤션: {trip_id}/{uuid}.{ext} — trip_id로 trips.user_id를 확인해
-- 소유자만 업로드/조회/삭제 가능하게 한다. 비공개 버킷이라 클라이언트는 signed URL로 접근한다.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 10485760, array['image/jpeg', 'image/png']);

create policy "receipts_own" on storage.objects
  for all using (
    bucket_id = 'receipts'
    and exists (
      select 1 from public.trips t
      where t.id::text = (storage.foldername(name))[1]
        and t.user_id = auth.uid()
    )
  ) with check (
    bucket_id = 'receipts'
    and exists (
      select 1 from public.trips t
      where t.id::text = (storage.foldername(name))[1]
        and t.user_id = auth.uid()
    )
  );
