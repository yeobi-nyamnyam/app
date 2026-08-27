import AsyncStorage from "@react-native-async-storage/async-storage";

// 약관 동의 이력을 저장할 백엔드 스키마가 아직 없어서, 우선 기기 로컬(AsyncStorage)에만
// "이 계정은 이 기기에서 약관에 동의했다"를 기록한다. 백엔드 스키마가 생기면 이 두 함수의
// 내부 구현만 서버 저장으로 교체하면 된다.
const storageKey = (userId: string) => `signup-terms-agreed:${userId}`;

export async function hasAgreedToSignUpTerms(userId: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(storageKey(userId));
  return value === "true";
}

export async function markSignUpTermsAgreed(userId: string): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), "true");
}

// Supabase user의 created_at과 last_sign_in_at이 (초 단위 오차 내로) 같으면 방금 최초
// 가입한 사용자로 간주한다. 이 값이 기록되는 순간에만 신뢰할 수 있는 값이라, 로그인 성공
// 직후 한 번만 검사하고 그 결과에 따라 화면을 분기하는 용도로만 사용해야 한다.
const NEW_USER_THRESHOLD_MS = 5000;

export function isLikelyNewUser(user: {
  created_at: string;
  last_sign_in_at?: string | null;
}): boolean {
  if (!user.last_sign_in_at) {
    return true;
  }
  const createdAt = new Date(user.created_at).getTime();
  const lastSignInAt = new Date(user.last_sign_in_at).getTime();
  return Math.abs(lastSignInAt - createdAt) < NEW_USER_THRESHOLD_MS;
}
