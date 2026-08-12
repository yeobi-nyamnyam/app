import { ApolloProvider } from "@apollo/client/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { apolloClient } from "@/lib/apollo";
import { SessionProvider } from "@/hooks/useSession";

export default function RootLayout() {
  return (
    <SessionProvider>
      <ApolloProvider client={apolloClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}
