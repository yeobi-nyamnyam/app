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
