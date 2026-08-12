import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import { login as kakaoLogin } from "@react-native-seoul/kakao-login";
import Constants from "expo-constants";

import { supabase } from "@/lib/supabase";

const googleWebClientId = Constants.expoConfig?.extra?.googleClientId as string | undefined;

GoogleSignin.configure({
  webClientId: googleWebClientId,
});

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    return;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google로부터 idToken을 받지 못했습니다.");
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) {
    throw error;
  }
}

export async function signInWithKakao(): Promise<void> {
  const token = await kakaoLogin();

  if (!token.idToken) {
    throw new Error(
      "Kakao로부터 idToken을 받지 못했습니다. Kakao Developers 콘솔에서 OIDC(ID 토큰 발급)가 켜져 있는지 확인하세요.",
    );
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "kakao",
    token: token.idToken,
  });
  if (error) {
    throw error;
  }
}
