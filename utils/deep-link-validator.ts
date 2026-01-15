import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

/**
 * アプリの許可されたURLスキーム
 */
const ALLOWED_SCHEMES = ['bilog', 'exp'] as const;

/**
 * 許可されたリダイレクトパス
 */
const ALLOWED_REDIRECT_PATHS = ['/(tabs)', '/(auth)/sign-in', '/(auth)/sign-up'] as const;

/**
 * ディープリンクURLが安全かどうかを検証
 */
export function isValidDeepLink(url: string): boolean {
  try {
    const parsed = Linking.parse(url);

    // スキームの検証
    if (parsed.scheme && !ALLOWED_SCHEMES.includes(parsed.scheme as typeof ALLOWED_SCHEMES[number])) {
      if (__DEV__) {
        console.warn('[DeepLink] Invalid scheme:', parsed.scheme);
      }
      return false;
    }

    // パスの検証（許可されたパスのいずれかで始まるか）
    if (parsed.path) {
      const normalizedPath = parsed.path.startsWith('/') ? parsed.path : `/${parsed.path}`;
      const isAllowedPath = ALLOWED_REDIRECT_PATHS.some(
        allowed => normalizedPath === allowed || normalizedPath.startsWith(`${allowed}/`)
      );
      if (!isAllowedPath) {
        if (__DEV__) {
          console.warn('[DeepLink] Invalid path:', parsed.path);
        }
        return false;
      }
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('[DeepLink] Validation error:', error);
    }
    return false;
  }
}

/**
 * 安全なリダイレクトURLを生成
 * 指定されたパスが許可されていない場合はデフォルトのタブ画面にリダイレクト
 */
export function createSafeRedirectUrl(path: string = '/(tabs)'): string {
  const configScheme = Constants.expoConfig?.scheme;
  // schemeが配列の場合は最初の要素を使用
  const scheme = Array.isArray(configScheme) ? configScheme[0] : (configScheme || 'bilog');

  // パスが許可リストにあるか確認
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const isAllowed = ALLOWED_REDIRECT_PATHS.some(
    allowed => normalizedPath === allowed || normalizedPath.startsWith(`${allowed}/`)
  );

  const safePath = isAllowed ? path : '/(tabs)';

  return Linking.createURL(safePath, { scheme });
}

/**
 * OAuth コールバック用の安全なリダイレクトURL
 */
export function getOAuthRedirectUrl(): string {
  return createSafeRedirectUrl('/(tabs)');
}
