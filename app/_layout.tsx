import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { tokenCache } from '@/utils/token-cache';
import { syncUser } from '@/utils/api/auth';
import { CategoriesProvider } from '@/contexts/categories-context';
import { TreatmentsProvider } from '@/contexts/treatments-context';
import { ToastProvider } from '@/contexts/toast-context';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function InitialLayout() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const hasSynced = useRef(false);

  // ユーザーをデータベースに同期
  useEffect(() => {
    const doSyncUser = async () => {
      if (!isLoaded) return;

      // ログアウト時は同期フラグをリセット
      if (!isSignedIn) {
        hasSynced.current = false;
        return;
      }

      // 既に同期済みならスキップ
      if (hasSynced.current) return;

      try {
        const token = await getToken();
        if (token) {
          await syncUser(token);
          hasSynced.current = true;
          console.log('[Auth] User synced to database');
        }
      } catch (error) {
        // エラー時も同期済みフラグを立ててループを防ぐ
        hasSynced.current = true;
        if (error instanceof Error) {
          console.error('[Auth] Failed to sync user:', error.message, (error as { status?: number }).status);
        } else {
          console.error('[Auth] Failed to sync user:', error);
        }
      }
    };

    doSyncUser();
  }, [isLoaded, isSignedIn, getToken]);

  // ナビゲーション制御
  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CategoriesProvider>
        <TreatmentsProvider>
          <ToastProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="treatments/new" options={{ headerBackButtonDisplayMode: 'minimal' }} />
              <Stack.Screen name="treatments/list" options={{ headerBackButtonDisplayMode: 'minimal' }} />
              <Stack.Screen name="treatments/[id]" options={{ headerBackButtonDisplayMode: 'minimal' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ToastProvider>
        </TreatmentsProvider>
      </CategoriesProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <InitialLayout />
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
