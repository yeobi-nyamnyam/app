-- 여비냠냠 초기 스키마
-- docs/schema-design.md, erd.mermaid 참고 (세션 1 확정본)
-- 모든 테이블: id uuid default gen_random_uuid(), created_at, updated_at 포함
-- users(프로필)은 auth.users와 연동 (id가 auth.users.id를 참조, RLS는 auth.uid() 기준)

create extension if not exists pgcrypto;

-- =========================================
-- 0. updated_at 자동 갱신 트리거 함수
-- =========================================
create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================
-- 1. profiles (auth.users 확장 — 사용자 프로필)
-- =========================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  handle text not null unique,
  status text not null default 'active' check (status in ('active','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================
-- 2. trips
-- =========================================
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  region_code text not null,
  start_date date not null,
  end_date date not null,
  total_budget integer not null check (total_budget >= 1),
  fixed_cost integer not null default 0 check (fixed_cost >= 0),
  food_budget_ratio numeric(5,2) not null,
  floating_budget integer not null default 0,
  status text not null default 'ongoing' check (status in ('ongoing','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

-- =========================================
-- 3. meal_slots
-- =========================================
create table public.meal_slots (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner')),
  weight_level text not null default 'normal' check (weight_level in ('light','normal','hearty')),
  budget_amount integer not null default 0,
  carried_over_amount integer not null default 0,
  is_recorded boolean not null default false,
  is_cascade_confirmed boolean not null default false,
  recorded_amount integer,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, date, meal_type)
);

create trigger set_updated_at
  before update on public.meal_slots
  for each row execute function public.set_updated_at();

-- =========================================
-- 4. restaurants (캐시 — 착한가격업소 + TourAPI 통합, F3 추천/지도용, 24시간 배치)
-- =========================================
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('good_price','tour_api')),
  external_id text not null,
  name text not null,
  address text not null,
  region_sido text,
  region_sigungu text,
  category text,
  cls_system2 text,
  cls_system3 text,
  phone text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  image_url text,
  price_menus jsonb,
  business_hours jsonb,
  overview text,
  last_synced_at timestamptz not null default now(),
  detail_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_id)
);

create trigger set_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

-- =========================================
-- 5. meal_logs
-- =========================================
create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  meal_slot_id uuid references public.meal_slots(id) on delete set null,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  category text not null check (category in ('식비','교통','숙박','기념품','기타')),
  amount integer not null,
  store_name text,
  store_address text,
  store_latitude numeric(10,7),
  store_longitude numeric(10,7),
  is_good_price boolean not null default false,
  memo text,
  source text not null check (source in ('home','recommend','chat','record')),
  receipt_image_url text,
  ocr_raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.meal_logs
  for each row execute function public.set_updated_at();

-- =========================================
-- 6. budget_change_history (append only)
-- =========================================
create table public.budget_change_history (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  event_type text not null,
  amount_delta integer not null default 0,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.budget_change_history
  for each row execute function public.set_updated_at();

-- =========================================
-- 7. chat_messages
-- =========================================
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','ai')),
  content text not null,
  parsed_category text,
  parsed_amount integer,
  status text not null default 'pending' check (status in ('pending','confirmed','discarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.chat_messages
  for each row execute function public.set_updated_at();

-- =========================================
-- 8. diaries
-- =========================================
create table public.diaries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  mode text not null check (mode in ('manual','ai')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, date)
);

create trigger set_updated_at
  before update on public.diaries
  for each row execute function public.set_updated_at();

-- =========================================
-- 9. badges (마스터/시드 데이터)
-- =========================================
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  category text not null,
  name text not null,
  description text,
  bonus_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.badges
  for each row execute function public.set_updated_at();

-- =========================================
-- 10. user_badges
-- =========================================
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, trip_id, badge_id)
);

create trigger set_updated_at
  before update on public.user_badges
  for each row execute function public.set_updated_at();

-- =========================================
-- 11. exp_ledger (append only)
-- =========================================
create table public.exp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  event_type text not null,
  points integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.exp_ledger
  for each row execute function public.set_updated_at();

-- =========================================
-- 12. region_cache (정적 시드 데이터 — 지원 지역 화이트리스트)
-- =========================================
create table public.region_cache (
  id uuid primary key default gen_random_uuid(),
  region_code text not null unique,
  region_name text not null,
  tour_api_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.region_cache
  for each row execute function public.set_updated_at();

-- =========================================
-- RLS
-- =========================================
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.meal_slots enable row level security;
alter table public.restaurants enable row level security;
alter table public.meal_logs enable row level security;
alter table public.budget_change_history enable row level security;
alter table public.chat_messages enable row level security;
alter table public.diaries enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.exp_ledger enable row level security;
alter table public.region_cache enable row level security;

-- profiles: 본인만
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- trips: 본인만
create policy "trips_own" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- meal_slots: trip 소유자만
create policy "meal_slots_own" on public.meal_slots
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- meal_logs: trip 소유자만
create policy "meal_logs_own" on public.meal_logs
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- budget_change_history: trip 소유자만 (읽기 위주, insert는 서버/함수 경유 권장)
create policy "budget_history_own" on public.budget_change_history
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- chat_messages: 본인만
create policy "chat_messages_own" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- diaries: trip 소유자만
create policy "diaries_own" on public.diaries
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- badges: 전체 조회 허용, 쓰기는 service role만 (정책 없음 = anon/authenticated 쓰기 불가)
create policy "badges_read_all" on public.badges
  for select using (true);

-- user_badges: 본인만
create policy "user_badges_own" on public.user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- exp_ledger: 본인만
create policy "exp_ledger_own" on public.exp_ledger
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- region_cache: 전체 조회 허용, 쓰기는 service role만
create policy "region_cache_read_all" on public.region_cache
  for select using (true);

-- restaurants: 전체 조회 허용, 쓰기는 service role만 (F3-5 배치 캐싱 전용)
create policy "restaurants_read_all" on public.restaurants
  for select using (true);
