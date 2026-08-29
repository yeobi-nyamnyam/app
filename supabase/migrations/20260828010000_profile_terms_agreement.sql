-- 약관 동의 이력을 profiles에 저장 (F0, 후속: 이슈 #49 F0-4 이후 진행하기로 한 작업)
-- terms_agreed_at: 필수 약관(서비스 이용약관/개인정보 처리방침/만 14세 이상 확인/
--   위치정보 이용 동의)을 일괄 동의한 시각. null이면 미동의.
-- marketing_agreed: 마케팅 정보 수신 동의(선택 항목) 여부.

alter table public.profiles
  add column terms_agreed_at timestamptz,
  add column marketing_agreed boolean not null default false;
