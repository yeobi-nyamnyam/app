import type { User } from "@supabase/supabase-js";
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import { initializeKakaoSDK } from "@react-native-kakao/core";
import { login as kakaoLogin } from "@react-native-kakao/user";
import Constants from "expo-constants";

import { supabase } from "@/lib/supabase";

const googleWebClientId = Constants.expoConfig?.extra?.googleClientId as string | undefined;
const kakaoNativeAppKey = Constants.expoConfig?.extra?.kakaoNativeAppKey as string | undefined;

GoogleSignin.configure({
  webClientId: googleWebClientId,
});

// 카카오 API를 하나라도 쓰기 전에 반드시 먼저 호출돼야 한다(공식 문서 요구사항) —
// 이게 없으면 KakaoSdk가 미초기화 상태라 로그인 호출 시 네이티브에서 크래시난다.
if (kakaoNativeAppKey) {
  void initializeKakaoSDK(kakaoNativeAppKey);
}

export async function signInWithGoogle(): Promise<User | null> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    return null;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google로부터 idToken을 받지 못했습니다.");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) {
    throw error;
  }
  return data.user;
}

export async function signInWithKakao(): Promise<User | null> {
  const token = await kakaoLogin();

  if (!token.idToken) {
    throw new Error(
      "Kakao로부터 idToken을 받지 못했습니다. Kakao Developers 콘솔에서 OIDC(ID 토큰 발급)가 켜져 있는지 확인하세요.",
    );
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "kakao",
    token: token.idToken,
  });
  if (error) {
    throw error;
  }
  return data.user;
}
