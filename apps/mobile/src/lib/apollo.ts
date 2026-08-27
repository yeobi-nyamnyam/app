import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import Constants from "expo-constants";

import { supabase } from "@/lib/supabase";

// Supabase GraphQL(pg_graphql) 엔드포인트에 클라이언트가 직접 접속 (RLS로 보호됨).
// docs/api-server-boundaries.md: "Supabase(Auth/GraphQL)는 클라이언트 직접 호출 정상".
// apps/server는 외부 API 프록시/AI 채팅 전용 REST 서버이지 GraphQL 게이트웨이가 아님.
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env config (extra.supabaseUrl / extra.supabaseAnonKey)");
}

const httpLink = new HttpLink({
  uri: `${supabaseUrl}/graphql/v1`,
  fetch: async (uri, options) => {
    const { data } = await supabase.auth.getSession();
    const headers = new Headers(options?.headers);
    headers.set("apikey", supabaseAnonKey);
    headers.set(
      "Authorization",
      `Bearer ${data.session?.access_token ?? supabaseAnonKey}`,
    );
    return fetch(uri, { ...options, headers });
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
