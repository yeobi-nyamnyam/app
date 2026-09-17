import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import { useSession } from "@/hooks/useSession";
import { hasAgreedToSignUpTerms } from "@/lib/onboarding";

type TermsAgreementContextValue = {
  // null이면 아직 확인 중
  termsAgreed: boolean | null;
  markAgreed: () => void;
};

const TermsAgreementContext = createContext<TermsAgreementContextValue | undefined>(undefined);

export function TermsAgreementProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const [termsAgreed, setTermsAgreed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      setTermsAgreed(null);
      return;
    }

    let cancelled = false;
    hasAgreedToSignUpTerms(session.user.id).then((agreed) => {
      if (!cancelled) {
        setTermsAgreed(agreed);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  return (
    <TermsAgreementContext.Provider
      value={{ termsAgreed, markAgreed: () => setTermsAgreed(true) }}
    >
      {children}
    </TermsAgreementContext.Provider>
  );
}

export function useTermsAgreement(): TermsAgreementContextValue {
  const context = useContext(TermsAgreementContext);
  if (!context) {
    throw new Error("useTermsAgreement은 TermsAgreementProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
