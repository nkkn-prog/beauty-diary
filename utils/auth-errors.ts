/**
 * Clerk認証エラーを日本語に変換するユーティリティ
 */

interface ClerkError {
  code: string;
  message: string;
  longMessage?: string;
  meta?: Record<string, unknown>;
}

interface ClerkErrorResponse {
  errors?: ClerkError[];
  clerkError?: boolean;
}

interface TranslatedError {
  title: string;
  message: string;
  hint?: string;
}

// Clerkのエラーコードと日本語メッセージのマッピング
const errorTranslations: Record<string, TranslatedError> = {
  // パスワード関連
  form_password_pwned: {
    title: 'パスワードが安全ではありません',
    message: 'このパスワードは過去のデータ漏洩で見つかっています。',
    hint: '他のサービスで使用していない、新しいパスワードを設定してください。',
  },
  form_password_length_too_short: {
    title: 'パスワードが短すぎます',
    message: 'パスワードは8文字以上で入力してください。',
    hint: '安全性を高めるため、数字や記号を含めることをおすすめします。',
  },
  form_password_not_strong_enough: {
    title: 'パスワードが弱すぎます',
    message: 'より強力なパスワードを設定してください。',
    hint: '大文字・小文字・数字・記号を組み合わせると安全性が高まります。',
  },
  form_password_size_in_bytes_exceeded: {
    title: 'パスワードが長すぎます',
    message: 'パスワードは72文字以下で入力してください。',
  },
  form_password_incorrect: {
    title: 'パスワードが間違っています',
    message: '入力されたパスワードが正しくありません。',
    hint: 'パスワードを忘れた場合は、パスワードリセットをお試しください。',
  },

  // メールアドレス関連
  form_identifier_exists: {
    title: 'このメールアドレスは既に登録されています',
    message: '別のメールアドレスで登録するか、ログインしてください。',
    hint: '以前に登録したことがある場合は、ログイン画面からお試しください。',
  },
  form_identifier_not_found: {
    title: 'アカウントが見つかりません',
    message: 'このメールアドレスで登録されたアカウントは存在しません。',
    hint: 'メールアドレスを確認するか、新規登録をお試しください。',
  },
  form_param_format_invalid: {
    title: '入力形式が正しくありません',
    message: 'メールアドレスの形式を確認してください。',
    hint: '例: example@email.com',
  },
  form_param_nil: {
    title: '入力が必要です',
    message: 'メールアドレスとパスワードの両方を入力してください。',
  },

  // 認証コード関連
  form_code_incorrect: {
    title: '認証コードが正しくありません',
    message: '入力されたコードが間違っているか、有効期限が切れています。',
    hint: 'メールに記載された6桁のコードを正確に入力してください。コードが届かない場合は再送信をお試しください。',
  },
  verification_expired: {
    title: '認証コードの有効期限が切れました',
    message: '新しい認証コードを送信する必要があります。',
    hint: '「コードを再送信」ボタンを押して、新しいコードを取得してください。',
  },
  verification_failed: {
    title: '認証に失敗しました',
    message: '認証処理中にエラーが発生しました。',
    hint: 'もう一度お試しください。問題が続く場合は、最初からやり直してください。',
  },

  // セッション関連
  session_exists: {
    title: '既にログインしています',
    message: '別のアカウントでログインする場合は、一度ログアウトしてください。',
  },
  session_invalid: {
    title: 'セッションが無効です',
    message: 'もう一度ログインしてください。',
  },

  // レート制限
  too_many_requests: {
    title: 'リクエストが多すぎます',
    message: 'しばらく時間をおいてから再度お試しください。',
    hint: '数分後にもう一度お試しください。',
  },

  // ネットワークエラー
  network_error: {
    title: '通信エラー',
    message: 'サーバーに接続できませんでした。',
    hint: 'インターネット接続を確認してから、もう一度お試しください。',
  },

  // その他
  unknown_error: {
    title: 'エラーが発生しました',
    message: '予期せぬエラーが発生しました。',
    hint: 'もう一度お試しください。問題が続く場合は、アプリを再起動してください。',
  },
};

/**
 * Clerkのエラーオブジェクトから日本語のエラー情報を取得
 */
export function translateAuthError(error: unknown): TranslatedError {
  // Clerkエラーオブジェクトの場合
  if (error && typeof error === 'object') {
    const clerkError = error as ClerkErrorResponse;

    // Clerkの標準エラー形式
    if (clerkError.errors && Array.isArray(clerkError.errors) && clerkError.errors.length > 0) {
      const firstError = clerkError.errors[0];
      const code = firstError.code;

      if (code && errorTranslations[code]) {
        return errorTranslations[code];
      }

      // 未知のコードの場合、元のメッセージを使用
      return {
        title: 'エラーが発生しました',
        message: firstError.message || '処理中にエラーが発生しました。',
        hint: 'もう一度お試しください。',
      };
    }

    // Errorオブジェクトの場合
    if (error instanceof Error) {
      // ネットワークエラーの検出
      if (
        error.message.includes('Network') ||
        error.message.includes('fetch') ||
        error.message.includes('connection')
      ) {
        return errorTranslations['network_error'];
      }

      // Clerkのエラーメッセージパターンを検出
      const message = error.message.toLowerCase();
      if (message.includes('password') && message.includes('pwned')) {
        return errorTranslations['form_password_pwned'];
      }
      if (message.includes('password') && message.includes('short')) {
        return errorTranslations['form_password_length_too_short'];
      }
      if (message.includes('already') && message.includes('exist')) {
        return errorTranslations['form_identifier_exists'];
      }
      if (message.includes('not found') || message.includes("couldn't find")) {
        return errorTranslations['form_identifier_not_found'];
      }
      if (message.includes('incorrect') && message.includes('code')) {
        return errorTranslations['form_code_incorrect'];
      }
      if (message.includes('rate') || message.includes('too many')) {
        return errorTranslations['too_many_requests'];
      }
    }
  }

  return errorTranslations['unknown_error'];
}

/**
 * エラーメッセージをフォーマットして表示用の文字列を返す
 */
export function formatAuthError(error: unknown): string {
  const translated = translateAuthError(error);
  let result = translated.message;
  if (translated.hint) {
    result += `\n\n${translated.hint}`;
  }
  return result;
}

/**
 * バリデーション用のヘルパー関数
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'メールアドレスを入力してください';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'メールアドレスの形式が正しくありません';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'パスワードを入力してください';
  }
  if (password.length < 8) {
    return 'パスワードは8文字以上で入力してください';
  }
  return null;
}

export function validateVerificationCode(code: string): string | null {
  if (!code.trim()) {
    return '認証コードを入力してください';
  }
  if (!/^\d{6}$/.test(code)) {
    return '認証コードは6桁の数字で入力してください';
  }
  return null;
}
