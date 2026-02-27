import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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
} from 'react-native';

import { OAuthButtons } from '@/components/auth';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  translateAuthError,
  validateEmail,
  validatePassword,
  validateVerificationCode,
} from '@/utils/auth-errors';

interface FormError {
  title: string;
  message: string;
  hint?: string;
}

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

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

  const onSignUp = async () => {
    if (!isLoaded) return;

    clearErrors();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: unknown) {
      const translated = translateAuthError(err);
      setError(translated);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;

    clearErrors();

    const codeError = validateVerificationCode(code);
    if (codeError) {
      setError({ title: '入力エラー', message: codeError });
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

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

  const onResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setResending(true);
    clearErrors();

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setError({
        title: 'コードを再送信しました',
        message: `${email} に新しい認証コードを送信しました。`,
        hint: 'メールが届くまで数分かかる場合があります。迷惑メールフォルダもご確認ください。',
      });
    } catch (err: unknown) {
      const translated = translateAuthError(err);
      setError(translated);
    } finally {
      setResending(false);
    }
  };

  const renderError = () => {
    if (!error) return null;

    const isSuccess = error.title.includes('再送信しました');
    const bgColor = isSuccess ? colors.successBackground : colors.errorBackground;
    const textColor = isSuccess ? colors.success : colors.error;

    return (
      <View style={[styles.errorContainer, { backgroundColor: bgColor }]}>
        <Text style={[styles.errorTitle, { color: textColor }]}>{error.title}</Text>
        <Text style={[styles.errorMessage, { color: textColor }]}>{error.message}</Text>
        {error.hint && (
          <Text style={[styles.errorHint, { color: textColor, opacity: 0.8 }]}>{error.hint}</Text>
        )}
      </View>
    );
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✉️</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>メール認証</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              {email} に認証コードを送信しました
            </Text>
            <Text style={[styles.description, { color: colors.secondaryText }]}>
              メールに記載された6桁のコードを入力してください。{'\n'}
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </Text>

            {renderError()}

            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="000000"
              placeholderTextColor={colors.secondaryText}
              value={code}
              onChangeText={(text) => {
                setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                clearErrors();
              }}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                code.length !== 6 && styles.buttonDisabled,
              ]}
              onPress={onVerify}
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>認証する</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={onResendCode}
              disabled={resending}
            >
              {resending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  コードを再送信する
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setPendingVerification(false);
                setCode('');
                clearErrors();
              }}
            >
              <Text style={[styles.backText, { color: colors.secondaryText }]}>
                メールアドレスを変更する
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>新規登録</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            アカウントを作成してください
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
              }}
              secureTextEntry
              autoComplete="new-password"
            />
            {fieldErrors.password ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                {fieldErrors.password}
              </Text>
            ) : (
              <Text style={[styles.fieldHint, { color: colors.secondaryText }]}>
                8文字以上で入力してください
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>登録する</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.secondaryText }]}>または</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <OAuthButtons
            mode="sign-up"
            disabled={loading}
            onError={setError}
            onClearErrors={clearErrors}
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              すでにアカウントをお持ちの方は
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkText, { color: colors.primary }]}>ログイン</Text>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
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
  codeInput: {
    height: 60,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    marginBottom: 20,
  },
  fieldError: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  fieldHint: {
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 15,
    fontWeight: '500',
  },
  backButton: {
    marginTop: 8,
    padding: 12,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
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
});
