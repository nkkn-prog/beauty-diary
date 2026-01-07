import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { translateAuthError, validateEmail, validatePassword } from '@/utils/auth-errors';

interface FormError {
  title: string;
  message: string;
  hint?: string;
}

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const onGoogleSignIn = useCallback(async () => {
    try {
      setGoogleLoading(true);
      clearErrors();

      const { createdSessionId, setActive: setActiveSession } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(tabs)', { scheme: 'beautydiary' }),
      });

      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const translated = translateAuthError(err);
      setError(translated);
    } finally {
      setGoogleLoading(false);
    }
  }, [startOAuthFlow, router]);

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSignIn = async () => {
    if (!isLoaded) return;

    clearErrors();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const translated = translateAuthError(err);
      setError(translated);
    } finally {
      setLoading(false);
    }
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.errorBackground }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>{error.title}</Text>
        <Text style={[styles.errorMessage, { color: colors.error }]}>{error.message}</Text>
        {error.hint && (
          <Text style={[styles.errorHint, { color: colors.error, opacity: 0.8 }]}>{error.hint}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>BeautyDiary</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            アカウントにログイン
          </Text>

          {renderError()}

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: fieldErrors.email ? colors.error : colors.border,
                },
              ]}
              placeholder="メールアドレス"
              placeholderTextColor={colors.secondaryText}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                if (error) clearErrors();
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <Text style={[styles.fieldError, { color: colors.error }]}>{fieldErrors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: fieldErrors.password ? colors.error : colors.border,
                },
              ]}
              placeholder="パスワード"
              placeholderTextColor={colors.secondaryText}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password)
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                if (error) clearErrors();
              }}
              secureTextEntry
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                {fieldErrors.password}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onSignIn}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>ログイン</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.secondaryText }]}>または</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, { borderColor: colors.border }]}
            onPress={onGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://www.google.com/favicon.ico' }}
                  style={styles.googleIcon}
                />
                <Text style={[styles.googleButtonText, { color: colors.text }]}>
                  Googleでログイン
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              アカウントをお持ちでない方は
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkText, { color: colors.primary }]}>新規登録</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorHint: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  fieldError: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  googleButton: {
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
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
