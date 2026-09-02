// L2(레벨) 구간표 — Lv1~Lv7은 고정값, Lv8부터는 직전 구간(포인트 간격)에 1.5배씩
// 곱해가며 무한히 늘어난다 (사용자 확정 스펙, docs에는 "하드코딩된 구간표"로만 명시).
// [레벨, 그 레벨에 도달하는 데 필요한 누적 포인트]
const KNOWN_LEVEL_THRESHOLDS: [level: number, points: number][] = [
  [1, 0],
  [2, 50],
  [3, 150],
  [4, 300],
  [5, 550],
  [6, 900],
  [7, 1400],
];

const LAST_KNOWN_LEVEL = 7;
const LAST_KNOWN_THRESHOLD = 1400;
const LAST_KNOWN_INTERVAL = 1400 - 900; // Lv6→Lv7 구간

/**
 * @param totalPoints exp_ledger 누적 포인트 합계
 */
export const getCharacterLevel = (totalPoints: number): number => {
  if (totalPoints < LAST_KNOWN_THRESHOLD) {
    return KNOWN_LEVEL_THRESHOLDS.reduce(
      (reached, [level, threshold]) => (totalPoints >= threshold ? level : reached),
      1,
    );
  }

  let level = LAST_KNOWN_LEVEL;
  let threshold = LAST_KNOWN_THRESHOLD;
  let interval = LAST_KNOWN_INTERVAL;

  while (true) {
    const nextInterval = Math.round(interval * 1.5);
    const nextThreshold = threshold + nextInterval;
    if (totalPoints < nextThreshold) break;
    interval = nextInterval;
    threshold = nextThreshold;
    level += 1;
  }
  return level;
};

// L3(캐릭터 진화 단계) — 사용자 확정 스펙
const EVOLUTION_STAGES: { maxLevel: number; label: string }[] = [
  { maxLevel: 2, label: "알" },
  { maxLevel: 4, label: "새싹 냠냠이" },
  { maxLevel: 6, label: "미식가 냠냠이" },
  { maxLevel: 9, label: "여행왕 냠냠이" },
  { maxLevel: Infinity, label: "냠냠 마스터" },
];

/**
 * @param level getCharacterLevel 결과
 */
export const getCharacterStage = (level: number): string =>
  EVOLUTION_STAGES.find((stage) => level <= stage.maxLevel)?.label ?? "냠냠 마스터";
