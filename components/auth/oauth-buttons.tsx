import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { translateAuthError } from '@/utils/auth-errors';
import { getOAuthRedirectUrl } from '@/utils/deep-link-validator';

WebBrowser.maybeCompleteAuthSession();

interface OAuthButtonsProps {
  mode: 'sign-in' | 'sign-up';
  disabled?: boolean;
  onError?: (error: { title: string; message: string; hint?: string }) => void;
  onClearErrors?: () => void;
}

export function OAuthButtons({ mode, disabled, onError, onClearErrors }: OAuthButtonsProps) {
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const isLoading = googleLoading || appleLoading;

  const label = mode === 'sign-in' ? 'でログイン' : 'で登録';

  const handleOAuth = useCallback(
    async (
      provider: 'google' | 'apple',
      startFlow: typeof startGoogleOAuth,
      setLoading: (v: boolean) => void,
    ) => {
      try {
        setLoading(true);
        onClearErrors?.();

        const { createdSessionId, setActive } = await startFlow({
          redirectUrl: getOAuthRedirectUrl(),
        });

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          router.replace('/(tabs)');
        }
      } catch (err: unknown) {
        const translated = translateAuthError(err);
        onError?.(translated);
      } finally {
        setLoading(false);
      }
    },
    [router, onError, onClearErrors],
  );

  const onGooglePress = useCallback(
    () => handleOAuth('google', startGoogleOAuth, setGoogleLoading),
    [handleOAuth, startGoogleOAuth],
  );

  const onApplePress = useCallback(
    () => handleOAuth('apple', startAppleOAuth, setAppleLoading),
    [handleOAuth, startAppleOAuth],
  );

  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.oauthButton, { borderColor: colors.border }]}
        onPress={onGooglePress}
        disabled={disabled || isLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <Image
              source={{ uri: 'https://www.google.com/favicon.ico' }}
              style={styles.googleIcon}
            />
            <Text style={[styles.oauthButtonText, { color: colors.text }]}>
              Google{label}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={[
            styles.oauthButton,
            isDark
              ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }
              : { backgroundColor: '#000000', borderColor: '#000000' },
          ]}
          onPress={onApplePress}
          disabled={disabled || isLoading}
        >
          {appleLoading ? (
            <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} />
          ) : (
            <>
              <Ionicons
                name="logo-apple"
                size={20}
                color={isDark ? '#000000' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.oauthButtonText,
                  { color: isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                Apple{label}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  oauthButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
