import "dotenv/config";

import { getSupabaseAdmin } from "../lib/supabase";

// TERMS_UNCONSENTED_CLEANUP_HOURS: 약관 미동의 상태(profiles.terms_agreed_at is null)로
// 이 시간(시간 단위) 넘게 방치된 유저를 정리 대상으로 본다. 기본 24시간.
const CLEANUP_THRESHOLD_HOURS = Number(process.env.TERMS_UNCONSENTED_CLEANUP_HOURS ?? "24");
// DRY_RUN=true면 실제로 삭제하지 않고 정리 대상 목록만 출력한다 — auth.users를
// 실제로 지우는 작업이라, 공유 개발 DB에서 먼저 대상만 확인하고 싶을 때 쓴다.
const isDryRun = process.env.DRY_RUN === "true";

interface UnconsentedProfile {
  id: string;
  created_at: string;
}

async function main() {
  if (!Number.isFinite(CLEANUP_THRESHOLD_HOURS) || CLEANUP_THRESHOLD_HOURS < 0) {
    throw new Error(`Invalid TERMS_UNCONSENTED_CLEANUP_HOURS: ${process.env.TERMS_UNCONSENTED_CLEANUP_HOURS}`);
  }

  const cutoff = new Date(Date.now() - CLEANUP_THRESHOLD_HOURS * 60 * 60 * 1000).toISOString();
  console.info(
    `[terms-cleanup] 시작 (기준: 약관 미동의 + 생성 ${CLEANUP_THRESHOLD_HOURS}시간 경과, cutoff=${cutoff}${isDryRun ? ", DRY RUN" : ""})`,
  );

  const supabase = getSupabaseAdmin();
  const { data: targets, error: selectError } = await supabase
    .from("profiles")
    .select("id, created_at")
    .is("terms_agreed_at", null)
    .lt("created_at", cutoff)
    .returns<UnconsentedProfile[]>();

  if (selectError) {
    throw new Error(`대상 조회 실패: ${selectError.message}`);
  }
  if (!targets || targets.length === 0) {
    console.info("[terms-cleanup] 정리 대상 없음");
    return;
  }
  console.info(`[terms-cleanup] 정리 대상 ${targets.length}명`);
  targets.forEach((target) => console.info(`  - ${target.id} (가입: ${target.created_at})`));

  if (isDryRun) {
    console.info("[terms-cleanup] DRY RUN이라 실제로 삭제하지 않음");
    return;
  }

  // profiles.id references auth.users(id) on delete cascade라, auth.users에서
  // 지우면 profiles를 포함한 모든 유저 소유 데이터가 함께 정리된다.
  let deletedCount = 0;
  for (const target of targets) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(target.id);
    if (deleteError) {
      console.error(`[terms-cleanup] 삭제 실패: ${target.id} (가입: ${target.created_at})`, deleteError.message);
      continue;
    }
    deletedCount += 1;
  }

  console.info(`[terms-cleanup] 완료: ${deletedCount}/${targets.length}명 삭제`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[terms-cleanup] 배치 실패", error);
    process.exit(1);
  });
