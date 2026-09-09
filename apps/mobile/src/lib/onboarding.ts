import { AgreeToSignUpTermsDocument, ProfileDocument } from "@repo/types";

import { apolloClient } from "@/lib/apollo";

export async function hasAgreedToSignUpTerms(userId: string): Promise<boolean> {
  const { data } = await apolloClient.query({
    query: ProfileDocument,
    variables: { id: userId },
    fetchPolicy: "network-only",
  });
  return data?.profilesByPk?.terms_agreed_at != null;
}

export async function markSignUpTermsAgreed(
  userId: string,
  marketingAgreed: boolean,
): Promise<void> {
  await apolloClient.mutate({
    mutation: AgreeToSignUpTermsDocument,
    variables: {
      id: userId,
      agreedAt: new Date().toISOString(),
      marketingAgreed,
    },
  });
}
