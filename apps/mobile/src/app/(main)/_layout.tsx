import { Redirect, Stack, usePathname } from "expo-router";

import { useSession } from "@/hooks/useSession";
import { useTermsAgreement } from "@/hooks/useTermsAgreement";

// (main) 그룹은 URL 세그먼트에 노출되지 않아 pathname 기준으로는 이 경로가 된다.
const SIGN_UP_TERMS_PATH = "/auth/sign-up-terms";

export default function MainLayout() {
  const { session, isLoading } = useSession();
  const { termsAgreed } = useTermsAgreement();
  const pathname = usePathname();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // 확인 중(null)에는 잠깐 아무것도 렌더링하지 않는다.
  if (termsAgreed === null) {
    return null;
  }

  // 동의 안 한 상태로 세션만 복원된 경우(앱 재실행 등) 약관 동의 화면으로 보낸다.
  // 이미 그 화면에 있을 때도 계속 리다이렉트하면 Stack이 한 번도 마운트되지 않아
  // 무한 리다이렉트 루프("Maximum update depth exceeded")에 빠지므로 제외한다.
  if (!termsAgreed && pathname !== SIGN_UP_TERMS_PATH) {
    return <Redirect href="/(main)/auth/sign-up-terms" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
