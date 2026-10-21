import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { AppState } from "react-native";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env config (extra.supabaseUrl / extra.supabaseAnonKey)");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// RN 앱이 백그라운드로 가면 토큰 자동 갱신 타이머를 멈추고,
// 포그라운드로 돌아오면 다시 시작한다 (Supabase 공식 RN 가이드 패턴).
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// apps/server 호출에 붙일 Authorization 헤더. 로그인 세션이 없으면 빈 객체를 돌려준다
// (서버가 아직 인증을 강제하지 않는 라우트도 있어서, 토큰이 없다고 요청 자체를 막지는 않는다).
export async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}
