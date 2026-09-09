-- =========================================
-- update_meal_log에 category 수정 지원 추가
-- 기타소비(교통/숙박/기념품/기타) 상세 화면(Figma)에서 카테고리를 칩으로 바꿀 수
-- 있어야 해서 p_category를 추가한다. 기존 파라미터 이름/순서는 그대로 두고
-- 맨 뒤에 default null로 추가 — 값을 안 넘기면(null) 카테고리는 그대로 유지된다.
-- 끼니 소비(식비) 편집 화면은 카테고리 칩 자체를 안 보여주므로 p_category를
-- 넘기지 않는다.
-- =========================================
create or replace function public.update_meal_log(
  p_meal_log_id uuid,
  p_amount int,
  p_store_name text default null,
  p_store_address text default null,
  p_memo text default null,
  p_category text default null
) returns public.meal_logs language plpgsql as $$
declare
  v_log public.meal_logs;
  v_trip_status text;
begin
  select * into v_log from public.meal_logs where id = p_meal_log_id;
  if v_log.id is null then
    raise exception '수정할 소비 기록을 찾을 수 없습니다';
  end if;

  select status into v_trip_status from public.trips where id = v_log.trip_id;
  if v_trip_status = 'completed' then
    raise exception '완료된 여행의 기록은 수정할 수 없습니다';
  end if;

  update public.meal_logs
  set amount = p_amount,
      store_name = p_store_name,
      store_address = p_store_address,
      memo = p_memo,
      category = coalesce(p_category, category)
  where id = p_meal_log_id
  returning * into v_log;

  if v_log.meal_slot_id is not null then
    update public.meal_slots
    set recorded_amount = p_amount
    where id = v_log.meal_slot_id;
  end if;

  return v_log;
end;
$$;
