import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';

export default function HomeScreen() {
  const { isLoggedIn, logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Soccer Planner</Text>
        <Text style={styles.title}>Plan your next pickup match.</Text>
        <Text style={styles.message}>
          {isLoggedIn
            ? `Welcome back${user?.name ? `, ${user.name}` : ''}. Browse matches and join the games you want to play.`
            : 'Welcome to Soccer Planner. Log in to view your groups, browse matches, and join the games you want to play.'}
        </Text>

        <View style={styles.actions}>
          {isLoggedIn ? (
            <>
              <Pressable
                onPress={() => router.push('/matches')}
                style={({ hovered, pressed }) => [
                  styles.primaryButton,
                  hovered && styles.primaryButtonHovered,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.primaryButtonText}>View matches</Text>
              </Pressable>
              <Pressable
                onPress={logout}
                style={({ hovered, pressed }) => [
                  styles.secondaryButton,
                  hovered && styles.secondaryButtonHovered,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.secondaryButtonText}>Logout</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => router.push('/login')}
              style={({ hovered, pressed }) => [
                styles.primaryButton,
                hovered && styles.primaryButtonHovered,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.primaryButtonText}>Log in</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 520,
    gap: 18,
  },
  eyebrow: {
    color: '#0f7a3b',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#102014',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  message: {
    color: '#3f5144',
    fontSize: 17,
    lineHeight: 25,
  },
  actions: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0f7a3b',
    borderColor: '#0b5f2e',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 120,
    paddingHorizontal: 22,
    paddingVertical: 14,
    shadowColor: '#0b5f2e',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  primaryButtonHovered: {
    backgroundColor: '#0b6d34',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#0f7a3b',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 120,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  secondaryButtonHovered: {
    backgroundColor: '#eaf3ed',
  },
  secondaryButtonText: {
    color: '#0f7a3b',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
