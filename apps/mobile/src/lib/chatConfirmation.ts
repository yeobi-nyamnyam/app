// 오늘 끼니가 이미 다 찼을 때 "기타소비로 기록해드릴까요?" 제안에 대한 응답을 기다리는 상태.
// declined는 한 번 거절한 뒤 "아니다 그냥 기록해줘"처럼 마음을 바꿀 여지를 딱 한 번만 더
// 열어두기 위한 플래그 — 계속 열어두면 한참 뒤 무관한 메시지가 우연히 no로 판정돼 오작동할
// 수 있어 창을 넓히지 않는다. clarifyAttempts는 confirmIntent가 unclear로 반복될 때, 금액을
// 잃고 처음부터 다시 입력하게 만들지 않으려고 명확히 되묻는 횟수를 세다가(최대 3회) 접는다.
export interface PendingOtherExpenseSuggestion {
  amount: number;
  declined: boolean;
  clarifyAttempts: number;
}

export type PendingConfirmationResolution =
  | { action: "record" }
  | { action: "keepPending"; suggestion: PendingOtherExpenseSuggestion }
  | { action: "close" };

const MAX_CLARIFY_ATTEMPTS = 3;

/**
 * @param suggestion 확인 대기 중인 "기타소비로 기록할까요?" 상태
 * @param confirmIntent 서버가 이번 메시지를 pendingConfirmation 컨텍스트로 함께 해석해 돌려준 값:
 *   'yes' | 'no' | 'unclear'
 *
 * pendingConfirmation 상태에서 온 사용자 메시지를 LLM이 해석한 confirmIntent를 받아 다음 상태를
 * 결정한다. 정규식으로 메시지 전체를 예/아니오로만 읽지 않고 LLM 판단에 맡기는 이유는, "아니,
 * 근데 삭제는 못해주는거야?"처럼 거절과 무관한 질문이 섞인 메시지에서 질문이 통째로 씹히는
 * 문제 때문이다(reply는 이 함수와 별개로 항상 그대로 화면에 표시된다).
 */
export const resolvePendingConfirmation = (
  suggestion: PendingOtherExpenseSuggestion,
  confirmIntent: "yes" | "no" | "unclear",
): PendingConfirmationResolution => {
  if (confirmIntent === "yes") return { action: "record" };

  if (confirmIntent === "no") {
    if (suggestion.declined) return { action: "close" };
    return { action: "keepPending", suggestion: { ...suggestion, declined: true, clarifyAttempts: 0 } };
  }

  const clarifyAttempts = suggestion.clarifyAttempts + 1;
  if (clarifyAttempts >= MAX_CLARIFY_ATTEMPTS) return { action: "close" };
  return { action: "keepPending", suggestion: { ...suggestion, clarifyAttempts } };
};
