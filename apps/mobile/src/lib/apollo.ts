import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

import { supabase } from "@/lib/supabase";

// apps/server GraphQL endpoint. Override with EXPO_PUBLIC_GRAPHQL_URL for staging/prod.
const graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

const httpLink = new HttpLink({
  uri: graphqlUrl,
  fetch: async (uri, options) => {
    const { data } = await supabase.auth.getSession();
    const headers = new Headers(options?.headers);
    if (data.session?.access_token) {
      headers.set("Authorization", `Bearer ${data.session.access_token}`);
    }
    return fetch(uri, { ...options, headers });
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
