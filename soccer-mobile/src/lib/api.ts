import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

function getExpoDevServerHost() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] || null;
}

function getApiBaseUrl() {
  if (Platform.OS === 'web' || !configuredApiBaseUrl.includes('localhost')) {
    return configuredApiBaseUrl;
  }

  const devServerHost = getExpoDevServerHost();

  if (!devServerHost) {
    return configuredApiBaseUrl;
  }

  return configuredApiBaseUrl.replace('localhost', devServerHost);
}

const API_BASE_URL = getApiBaseUrl();

function isLocalWebHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function assertUsableApiBaseUrl() {
  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    API_BASE_URL.includes('localhost') &&
    !isLocalWebHost(window.location.hostname)
  ) {
    throw new ApiError(
      'The deployed app is still configured to use localhost. Set EXPO_PUBLIC_API_BASE_URL to your deployed API URL and redeploy.',
      0,
    );
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type ApiOptions = {
  method?: 'GET' | 'POST';
  token?: string | null;
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  assertUsableApiBaseUrl();

  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Something went wrong. Please try again.';

    throw new ApiError(message, response.status);
  }

  return data as T;
}
