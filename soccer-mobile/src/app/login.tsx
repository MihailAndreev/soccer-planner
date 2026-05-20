import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(trimmedEmail, password);
      router.replace('/matches');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 24}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Use your Soccer Planner account to continue.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              importantForAutofill="no"
              keyboardType="email-address"
              onChangeText={setEmail}
              style={styles.input}
              textContentType="none"
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              importantForAutofill="no"
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              secureTextEntry
              style={styles.input}
              textContentType="none"
              value={password}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            disabled={isSubmitting}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.button,
              (pressed || isSubmitting) && styles.pressed,
              isSubmitting && styles.disabled,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    alignSelf: 'center',
    gap: 14,
    maxWidth: 460,
    width: '100%',
  },
  title: {
    color: '#102014',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#3f5144',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 6,
  },
  field: {
    gap: 7,
  },
  label: {
    color: '#102014',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cad8ce',
    borderRadius: 8,
    borderWidth: 1,
    color: '#102014',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  error: {
    backgroundColor: '#fff0f0',
    borderColor: '#e5b5b5',
    borderRadius: 8,
    borderWidth: 1,
    color: '#9a1f1f',
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0f7a3b',
    borderRadius: 8,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.82,
  },
});
