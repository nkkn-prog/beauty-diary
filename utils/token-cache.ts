import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TokenCache } from '@clerk/clerk-expo';

/**
 * ネイティブプラットフォーム用のSecureStoreベースのトークンキャッシュ
 */
const createNativeTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (error) {
        if (__DEV__) {
          console.error('SecureStore getToken error:', error);
        }
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      try {
        await SecureStore.setItemAsync(key, token);
      } catch (error) {
        if (__DEV__) {
          console.error('SecureStore saveToken error:', error);
        }
      }
    },
    clearToken: async (key: string) => {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        if (__DEV__) {
          console.error('SecureStore clearToken error:', error);
        }
      }
    },
  };
};

/**
 * Webプラットフォーム用のlocalStorageベースのトークンキャッシュ
 * 注意: localStorageは暗号化されないため、機密性の高いトークンには不向き
 * しかし、Clerkが管理するセッショントークンは有効期限が短いため許容可能
 */
const createWebTokenCache = (): TokenCache => {
  const TOKEN_PREFIX = '__clerk_token_';

  return {
    getToken: async (key: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(`${TOKEN_PREFIX}${key}`);
        }
        return null;
      } catch (error) {
        if (__DEV__) {
          console.error('localStorage getToken error:', error);
        }
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`${TOKEN_PREFIX}${key}`, token);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('localStorage saveToken error:', error);
        }
      }
    },
    clearToken: async (key: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(`${TOKEN_PREFIX}${key}`);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('localStorage clearToken error:', error);
        }
      }
    },
  };
};

/**
 * プラットフォームに応じたトークンキャッシュを提供
 * - iOS/Android: SecureStore (暗号化ストレージ)
 * - Web: localStorage (非暗号化、セッショントークン用)
 */
export const tokenCache =
  Platform.OS === 'web' ? createWebTokenCache() : createNativeTokenCache();
