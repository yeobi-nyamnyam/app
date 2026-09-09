import { createClient } from "@supabase/supabase-js";

// service role 클라이언트는 auth.admin.* 같은 관리자 API를 쓸 때만 호출부에서 지연 생성한다.
// 모듈 로드 시점에 바로 만들면, 이 키가 아직 세팅 안 된 로컬 환경에서 이 파일을 import하는
// 것만으로 서버 전체가 부팅에 실패해버림 (health check 등 이 키가 필요 없는 라우트까지 영향).
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role env config (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
