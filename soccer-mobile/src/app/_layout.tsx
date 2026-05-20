import { Stack } from 'expo-router';

import { AuthProvider } from '@/lib/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f7a3b',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#f4f7f2',
          },
        }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="matches" options={{ title: 'Matches' }} />
        <Stack.Screen name="matches/[id]" options={{ title: 'Match Details' }} />
      </Stack>
    </AuthProvider>
  );
}
