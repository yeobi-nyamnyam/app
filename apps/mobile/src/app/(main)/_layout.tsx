import { Redirect, Stack } from "expo-router";

import { useSession } from "@/hooks/useSession";
import { TripStoreProvider } from "@/lib/mock/tripStore";

export default function MainLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <TripStoreProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TripStoreProvider>
  );
}
