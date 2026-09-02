import { supabase } from "@/lib/supabase";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

// apps/server 계정 삭제 엔드포인트. Override with EXPO_PUBLIC_SERVER_URL for staging/prod.
const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:4000";

export async function deleteAccount(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetchWithTimeout(`${serverUrl}/auth/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  await supabase.auth.signOut();
}
