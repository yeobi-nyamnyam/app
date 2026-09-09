// 일기 AI 초안 생성(/diary/draft, #175) 전용 타임아웃 있는 fetch. Gemini 응답이
// 안 오면 순수 fetch()는 화면이 로딩 상태로 무한정 멈춰버려서(에뮬레이터 네트워크
// 스택이 간헐적으로 이런 증상을 보임), AbortController로 일정 시간 후 요청을
// 중단시켜 최소한 명확한 에러로 끝나게 한다. 다른 API 호출까지 넓히지 않는다 —
// 매장 검색처럼 응답이 느려도 다음 액션이 자연히 대체하는 경우엔 타임아웃이
// 오히려 방해가 된다는 피드백이 있었다.
export async function fetchWithTimeout(
  input: string,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    // React Native의 fetch 구현은 취소된 요청의 에러를 DOM 스펙의
    // `AbortError`가 아니라 일반 Error(메시지에 "canceled"만 포함)로 던져서
    // error.name으로 판별할 수 없다 — 타이머가 실제로 발화했는지로 구분한다.
    if (timedOut) {
      throw new Error("요청 시간이 초과됐어요. 잠시 후 다시 시도해주세요.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
