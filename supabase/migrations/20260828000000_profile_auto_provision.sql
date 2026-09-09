-- F0-4: 닉네임/고유ID 자동 생성 (이슈 #49)
-- OAuth 로그인으로 auth.users에 새 row가 생기면 트리거가 profiles row를 자동 생성한다.
-- docs/schema-design.md `profiles` 섹션 규칙:
--   nickname: '형용사+동물' 조합, 10자 이내, 중복 허용
--   handle:   '@' + 랜덤 4자 + '-v' + 숫자 형식, UNIQUE, 생성 후 수정 불가

create or replace function public.generate_random_nickname()
returns text
language sql
as $$
  select
    (array['용감한','신나는','다정한','엉뚱한','씩씩한','상큼한','느긋한','명랑한','활발한','차분한','수줍은','똑똑한'])
      [(floor(random() * 12) + 1)::int]
    || (array['여우','토끼','사자','판다','펭귄','수달','고래','하마','다람쥐','고양이','강아지','너구리','코알라','호랑이'])
      [(floor(random() * 14) + 1)::int];
$$;

create or replace function public.generate_random_handle()
returns text
language sql
as $$
  select '@' || substr(md5(random()::text || clock_timestamp()::text), 1, 4)
    || '-v' || (floor(random() * 9) + 1)::int;
$$;

-- handle은 UNIQUE라 충돌 가능성이 있어 재시도 루프를 둠 (36^4 * 9 조합이라 실제 충돌은 거의 없음)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate_handle text;
  attempt int := 0;
begin
  loop
    candidate_handle := public.generate_random_handle();
    attempt := attempt + 1;
    exit when attempt >= 20 or not exists (
      select 1 from public.profiles where handle = candidate_handle
    );
  end loop;

  insert into public.profiles (id, nickname, handle)
  values (new.id, public.generate_random_nickname(), candidate_handle);

  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
