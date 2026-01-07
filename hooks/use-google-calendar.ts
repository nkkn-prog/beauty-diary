import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Treatment } from '@/types/treatment';
import {
  addTreatmentToGoogleCalendar,
  CreateEventResult,
} from '@/utils/google-calendar';

type UseGoogleCalendarResult = {
  isAdding: boolean;
  isGoogleUser: boolean;
  addTreatmentToCalendar: (treatment: Treatment) => Promise<CreateEventResult>;
  promptGoogleLogin: () => void;
};

export function useGoogleCalendar(): UseGoogleCalendarResult {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  // Googleアカウントでログインしているかチェック
  const googleAccount = user?.externalAccounts?.find(
    (account) => account.provider === 'google'
  );
  const isGoogleUser = !!googleAccount;

  const promptGoogleLogin = useCallback(() => {
    Alert.alert(
      'Googleアカウントでログイン',
      'Google Calendarに予定を追加するには、Googleアカウントでログインしてください。\n\nプロフィール画面からログアウトし、Googleでログインし直してください。',
      [{ text: 'OK' }]
    );
  }, []);

  const addTreatmentToCalendar = useCallback(
    async (treatment: Treatment): Promise<CreateEventResult> => {
      if (!isGoogleUser || !googleAccount) {
        return { success: false, error: 'not_google_user' };
      }

      setIsAdding(true);
      try {
        // ClerkのJWTテンプレート経由でGoogleのOAuthアクセストークンを取得
        // Clerkダッシュボードで "google_oauth" テンプレートを作成する必要がある
        const token = await getToken({ template: 'oauth_google' });

        if (!token) {
          return { success: false, error: 'token_expired' };
        }

        return await addTreatmentToGoogleCalendar(token, treatment);
      } catch (error) {
        console.error('[useGoogleCalendar] Error:', error);
        return { success: false, error: 'unknown_error' };
      } finally {
        setIsAdding(false);
      }
    },
    [isGoogleUser, googleAccount, getToken]
  );

  return {
    isAdding,
    isGoogleUser,
    addTreatmentToCalendar,
    promptGoogleLogin,
  };
}
