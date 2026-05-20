import { Redirect } from 'expo-router';
import { PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';

export function ProtectedScreen({ children }: PropsWithChildren) {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0f7a3b" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

export function ScreenMessage({ message }: { message: string }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    color: '#3f5144',
    fontSize: 16,
    textAlign: 'center',
  },
});
