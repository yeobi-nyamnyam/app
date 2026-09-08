import type { getSupabaseAdmin } from "./supabase";

export const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

interface BatchUpsertOptions<Row extends Record<string, unknown>> {
  supabase: ReturnType<typeof getSupabaseAdmin>;
  table: string;
  onConflict: string;
  rows: Row[];
  chunkSize?: number;
  onItemError: (row: Row, message: string) => void;
}

// F3-5: restaurants 동기화 배치(syncGoodPriceRestaurants.ts, syncTourApiRestaurants.ts)가
// 업소 1건마다 upsert를 순차 호출해서, 전국 단위(수만 건) 실행 시 네트워크 round-trip 수에
// 비례해 배치 시간이 크게 늘어났다(PR #144 Copilot 리뷰에서 지적). chunkSize 단위로 묶어
// 한 번에 upsert해서 호출 수를 줄이되, 청크 전체가 실패하면(제약 위반 등) 그 청크만
// 항목 단위로 재시도해서 실제 실패 건만 골라내고 나머지는 성공 처리한다 — 청크 하나의
// 실패가 이후 청크 처리를 막지 않는다.
export async function batchUpsert<Row extends Record<string, unknown>>({
  supabase,
  table,
  onConflict,
  rows,
  chunkSize = 300,
  onItemError,
}: BatchUpsertOptions<Row>): Promise<number> {
  let succeeded = 0;

  for (const batch of chunk(rows, chunkSize)) {
    const { error } = await supabase.from(table).upsert(batch as Record<string, unknown>[], { onConflict });
    if (!error) {
      succeeded += batch.length;
      continue;
    }

    for (const row of batch) {
      const { error: itemError } = await supabase
        .from(table)
        .upsert(row as Record<string, unknown>, { onConflict });
      if (itemError) {
        onItemError(row, itemError.message);
        continue;
      }
      succeeded += 1;
    }
  }

  return succeeded;
}
