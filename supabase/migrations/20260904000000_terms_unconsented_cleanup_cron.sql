-- 약관 미동의 유저 정리 배치 (F0, 이슈 #209)
-- handle_new_user() 트리거가 OAuth 로그인 성공 즉시 profiles를 만들어서, 약관동의
-- 화면에서 이탈한 유저의 auth.users/profiles row가 terms_agreed_at=null 상태로
-- 무기한 남는다. profiles.id references auth.users(id) on delete cascade라
-- (20260812000000_initial_schema.sql), auth.users에서 지우면 관련 데이터가
-- 전부 같이 정리된다.
--
-- GitHub Actions 스케줄 워크플로 대신 pg_cron으로 구현한 이유: DB 안에서 직접
-- 실행돼 네트워크 왕복/서비스 롤 키 노출이 없고, GitHub의 "60일간 커밋 없으면
-- scheduled workflow 자동 비활성화" 정책에 영향받지 않는다.

create extension if not exists pg_cron;

create or replace function public.cleanup_unconsented_users()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users
  where id in (
    select id from public.profiles
    where terms_agreed_at is null
      and created_at < now() - interval '24 hours'
  );
end;
$$;

comment on function public.cleanup_unconsented_users() is
  '약관(필수 항목) 미동의 상태로 24시간 넘게 방치된 auth.users를 삭제한다 (F0, 이슈 #209).';

select cron.schedule(
  'cleanup-unconsented-users',
  '0 18 * * *', -- 매일 UTC 18:00 (KST 03:00)
  $$select public.cleanup_unconsented_users();$$
);
