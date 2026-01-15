import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Treatment } from '@/types/treatment';
import {
  addTreatmentToGoogleCalendar,
  deleteGoogleCalendarEvent,
  CreateEventResult,
  DeleteEventResult,
} from '@/utils/google-calendar';
import { getGoogleToken } from '@/utils/api/auth';

type UseGoogleCalendarResult = {
  isAdding: boolean;
  isDeleting: boolean;
  isGoogleUser: boolean;
  addTreatmentToCalendar: (treatment: Treatment) => Promise<CreateEventResult>;
  deleteFromCalendar: (eventId: string) => Promise<DeleteEventResult>;
  promptGoogleLogin: () => void;
};

export function useGoogleCalendar(): UseGoogleCalendarResult {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        // Clerk認証トークンを取得
        if (__DEV__) {
          console.log('[useGoogleCalendar] Getting Clerk token...');
        }
        const clerkToken = await getToken();

        if (!clerkToken) {
          if (__DEV__) {
            console.error('[useGoogleCalendar] No Clerk token');
          }
          return { success: false, error: 'token_expired' };
        }

        // バックエンドAPIからGoogle OAuthトークンを取得
        if (__DEV__) {
          console.log('[useGoogleCalendar] Getting Google token from backend...');
        }
        const { accessToken: googleAccessToken } = await getGoogleToken(clerkToken);
        if (__DEV__) {
          console.log('[useGoogleCalendar] Got Google token, adding to calendar...');
        }

        return await addTreatmentToGoogleCalendar(googleAccessToken, treatment);
      } catch (error) {
        if (__DEV__) {
          console.error('[useGoogleCalendar] Error:', error);
        }
        // APIエラーの場合はメッセージを確認
        if (error instanceof Error && error.message.includes('Googleアカウント')) {
          return { success: false, error: 'not_google_user' };
        }
        if (error instanceof Error && error.message.includes('認証が切れ')) {
          return { success: false, error: 'token_expired' };
        }
        return { success: false, error: 'api_error' };
      } finally {
        setIsAdding(false);
      }
    },
    [isGoogleUser, googleAccount, getToken]
  );

  const deleteFromCalendar = useCallback(
    async (eventId: string): Promise<DeleteEventResult> => {
      if (!isGoogleUser || !googleAccount) {
        return { success: false, error: 'not_google_user' };
      }

      setIsDeleting(true);
      try {
        if (__DEV__) {
          console.log('[useGoogleCalendar] Getting Clerk token for delete...');
        }
        const clerkToken = await getToken();

        if (!clerkToken) {
          if (__DEV__) {
            console.error('[useGoogleCalendar] No Clerk token');
          }
          return { success: false, error: 'token_expired' };
        }

        if (__DEV__) {
          console.log('[useGoogleCalendar] Getting Google token from backend...');
        }
        const { accessToken: googleAccessToken } = await getGoogleToken(clerkToken);
        if (__DEV__) {
          console.log('[useGoogleCalendar] Got Google token, deleting from calendar...');
        }

        return await deleteGoogleCalendarEvent(googleAccessToken, eventId);
      } catch (error) {
        if (__DEV__) {
          console.error('[useGoogleCalendar] Delete error:', error);
        }
        return { success: false, error: 'api_error' };
      } finally {
        setIsDeleting(false);
      }
    },
    [isGoogleUser, googleAccount, getToken]
  );

  return {
    isAdding,
    isDeleting,
    isGoogleUser,
    addTreatmentToCalendar,
    deleteFromCalendar,
    promptGoogleLogin,
  };
}
