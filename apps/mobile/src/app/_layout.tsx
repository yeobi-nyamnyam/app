import { ApolloProvider } from "@apollo/client/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { apolloClient } from "@/lib/apollo";

export default function RootLayout() {
  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </ApolloProvider>
  );
}
