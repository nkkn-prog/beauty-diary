import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * セキュリティ注意事項:
 *
 * AsyncStorageはデフォルトで暗号化されません。
 * 現在保存しているデータ:
 * - カテゴリ: ラベル、色（低機密性）
 * - サプリメント: 名前、絵文字、URL（低機密性）
 *
 * 機密性の高いデータ（トークン等）はSecureStoreを使用しています。
 *
 * 将来の改善案:
 * 1. expo-secure-storeの使用（ただしサイズ制限あり: 2048バイト）
 * 2. 暗号化ライブラリ（crypto-js等）でAES暗号化
 * 3. react-native-encrypted-storageの使用
 *
 * TODO: 以下の場合は暗号化を検討:
 * - 個人を特定できる情報を保存する場合
 * - 医療・健康に関する詳細情報を保存する場合
 * - HIPAA/GDPR等の規制対象となる場合
 */

/**
 * 将来の暗号化対応を見据えたストレージラッパー
 * 現時点では透過的にAsyncStorageを使用
 */
export const secureStorage = {
  /**
   * データを取得（将来は復号処理を追加）
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      // TODO: 暗号化実装時はここで復号
      return value;
    } catch (error) {
      if (__DEV__) {
        console.error('[SecureStorage] getItem error:', error);
      }
      return null;
    }
  },

  /**
   * データを保存（将来は暗号化処理を追加）
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      // TODO: 暗号化実装時はここで暗号化
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      if (__DEV__) {
        console.error('[SecureStorage] setItem error:', error);
      }
      throw error;
    }
  },

  /**
   * データを削除
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      if (__DEV__) {
        console.error('[SecureStorage] removeItem error:', error);
      }
      throw error;
    }
  },

  /**
   * 複数のキーを一括取得
   */
  async multiGet(keys: string[]): Promise<readonly [string, string | null][]> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      // TODO: 暗号化実装時はここで復号
      return results;
    } catch (error) {
      if (__DEV__) {
        console.error('[SecureStorage] multiGet error:', error);
      }
      return keys.map(key => [key, null] as [string, string | null]);
    }
  },
};

export default secureStorage;
