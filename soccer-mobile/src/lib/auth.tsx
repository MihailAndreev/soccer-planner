import * as SecureStore from 'expo-secure-store';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { apiRequest } from './api';

type User = {
  id?: number;
  name?: string;
  email: string;
};

type LoginResponse = {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: User;
};

type AuthContextValue = {
  isLoading: boolean;
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = 'soccer-planner-auth';
const AuthContext = createContext<AuthContextValue | null>(null);

async function readStoredAuth() {
  const rawValue =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEY)
      : await SecureStore.getItemAsync(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as Pick<AuthContextValue, 'token' | 'user'>;
  } catch {
    await clearStoredAuth();
    return null;
  }
}

async function clearStoredAuth() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }
}

async function writeStoredAuth(token: string | null, user: User | null) {
  if (!token || !user) {
    await clearStoredAuth();
    return;
  }

  const value = JSON.stringify({ token, user });

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, value);
  } else {
    await SecureStore.setItemAsync(STORAGE_KEY, value);
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function restoreAuth() {
      const storedAuth = await readStoredAuth();

      if (storedAuth?.token && storedAuth.user) {
        setToken(storedAuth.token);
        setUser(storedAuth.user);
      }

      setIsLoading(false);
    }

    restoreAuth();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isLoggedIn: Boolean(token),
      token,
      user,
      login: async (email: string, password: string) => {
        const response = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: { email, password },
        });

        setToken(response.token);
        setUser(response.user);
        await writeStoredAuth(response.token, response.user);
      },
      logout: () => {
        setToken(null);
        setUser(null);
        writeStoredAuth(null, null);
      },
    }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return auth;
}
