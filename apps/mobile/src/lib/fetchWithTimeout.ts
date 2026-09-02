export const DEFAULT_FETCH_TIMEOUT_MS = 15000;

// apps/server 호출에 공통으로 쓰는 타임아웃 있는 fetch. 기존엔 apps/mobile/src/lib의
// 모든 REST 호출이 순수 fetch()라 타임아웃이 없었다 — 네트워크가 잠깐이라도 막히면
// 응답이 영영 안 와서 화면이 로딩 상태로 무한정 멈춰버리는 문제가 있었다(에뮬레이터
// 네트워크 스택이 간헐적으로 이런 증상을 보임). AbortController로 일정 시간 후
// 요청을 중단시켜 최소한 명확한 에러로 끝나게 한다.
export async function fetchWithTimeout(
  input: string,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS,
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
