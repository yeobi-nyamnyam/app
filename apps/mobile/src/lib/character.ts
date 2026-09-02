import type { GrowthStage } from "@repo/ui";

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

// L3(캐릭터 진화 단계) — 구간(Lv1~2/3~4/5~6/7~9/10+)은 사용자 확정 스펙과
// Figma "캐릭터 성장"(node 406:2141)이 일치한다. 단, 단계 이름은 사용자 스펙
// (알/새싹 냠냠이/미식가 냠냠이/여행왕 냠냠이/냠냠 마스터)과 Figma 표기
// (새싹/여행자/배부른 여행자/미식 탐험가/예산 마스터)가 서로 달라서, 실제
// "캐릭터 성장" 화면을 만들 때 어느 쪽을 쓸지 확인이 필요 — 우선 사용자 스펙을
// 기본으로 둔다. 단계별 그림(GrowthStage 1~5)은 @repo/ui의 CharacterGrowth가
// Figma "Stage Row" 에셋을 그대로 옮긴 것.
const EVOLUTION_STAGES: { maxLevel: number; label: string; stage: GrowthStage }[] = [
  { maxLevel: 2, label: "알", stage: 1 },
  { maxLevel: 4, label: "새싹 냠냠이", stage: 2 },
  { maxLevel: 6, label: "미식가 냠냠이", stage: 3 },
  { maxLevel: 9, label: "여행왕 냠냠이", stage: 4 },
  { maxLevel: Infinity, label: "냠냠 마스터", stage: 5 },
];

// maxLevel: Infinity인 마지막 항목이 항상 매치되므로 find는 절대 undefined가 될 수 없다.
const findStage = (level: number) => EVOLUTION_STAGES.find((stage) => level <= stage.maxLevel) as (typeof EVOLUTION_STAGES)[number];

/**
 * @param level getCharacterLevel 결과
 */
export const getCharacterStage = (level: number): string => findStage(level).label;

/**
 * 진화 단계 그림 — CharacterGrowth 컴포넌트에 넘길 stage(1~5) 값.
 * @param level getCharacterLevel 결과
 */
export const getGrowthStage = (level: number): GrowthStage => findStage(level).stage;
