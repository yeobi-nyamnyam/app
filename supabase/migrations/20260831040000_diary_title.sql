-- D0: 일기 작성 화면(AI 초안/직접 쓰기)에 제목 입력란이 있는데 diaries에
-- 저장할 컬럼이 없어서 추가한다.
alter table public.diaries add column title text null;
