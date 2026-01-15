import AsyncStorage from '@react-native-async-storage/async-storage';
import { Supplement, MAX_SUPPLEMENTS } from '@/types/treatment';

/**
 * セキュリティ注意事項:
 * AsyncStorageは暗号化されていません。
 * サプリメントデータは低機密性（名前、絵文字、URLのみ）のため現状許容していますが、
 * より機密性の高いデータを追加する場合はsecure-storage.tsへの移行を検討してください。
 */
const SUPPLEMENTS_KEY = '@supplements';

/**
 * URLが安全なプロトコル（http/https）を使用しているかバリデート
 */
function validateUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('URLはhttp://またはhttps://で始まる必要があります');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('http')) {
      throw error;
    }
    throw new Error('無効なURL形式です');
  }
}

export async function getSupplements(): Promise<Supplement[]> {
  try {
    const json = await AsyncStorage.getItem(SUPPLEMENTS_KEY);
    if (json) {
      return JSON.parse(json) as Supplement[];
    }
    return [];
  } catch (error) {
    console.error('Failed to get supplements:', error);
    return [];
  }
}

export async function saveSupplements(supplements: Supplement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(supplements));
  } catch (error) {
    console.error('Failed to save supplements:', error);
    throw error;
  }
}

export async function addSupplement(name: string, emoji: string, url?: string): Promise<Supplement | null> {
  try {
    const supplements = await getSupplements();
    if (supplements.length >= MAX_SUPPLEMENTS) {
      throw new Error(`Maximum ${MAX_SUPPLEMENTS} supplements allowed`);
    }

    // URLバリデーション
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('サプリメント名を入力してください');
    }

    const trimmedUrl = url?.trim();
    if (trimmedUrl) {
      validateUrl(trimmedUrl);
    }

    const newSupplement: Supplement = {
      id: `supplement-${Date.now()}`,
      name: trimmedName,
      emoji,
      url: trimmedUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveSupplements([...supplements, newSupplement]);
    return newSupplement;
  } catch (error) {
    console.error('Failed to add supplement:', error);
    throw error;
  }
}

export async function updateSupplement(
  id: string,
  updates: Partial<Pick<Supplement, 'name' | 'emoji' | 'url'>>
): Promise<Supplement | null> {
  try {
    const supplements = await getSupplements();
    const index = supplements.findIndex((s) => s.id === id);
    if (index === -1) {
      return null;
    }

    // 入力値のサニタイズとバリデーション
    const sanitizedUpdates = { ...updates };
    if (updates.name !== undefined) {
      sanitizedUpdates.name = updates.name.trim();
      if (!sanitizedUpdates.name) {
        throw new Error('サプリメント名を入力してください');
      }
    }
    if (updates.url !== undefined) {
      const trimmedUrl = updates.url?.trim();
      if (trimmedUrl) {
        validateUrl(trimmedUrl);
      }
      sanitizedUpdates.url = trimmedUrl || undefined;
    }

    const updated: Supplement = {
      ...supplements[index],
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString(),
    };

    supplements[index] = updated;
    await saveSupplements(supplements);
    return updated;
  } catch (error) {
    console.error('Failed to update supplement:', error);
    throw error;
  }
}

export async function deleteSupplement(id: string): Promise<boolean> {
  try {
    const supplements = await getSupplements();
    const filtered = supplements.filter((s) => s.id !== id);
    if (filtered.length === supplements.length) {
      return false;
    }
    await saveSupplements(filtered);
    return true;
  } catch (error) {
    console.error('Failed to delete supplement:', error);
    throw error;
  }
}

export async function getSupplementById(id: string): Promise<Supplement | null> {
  try {
    const supplements = await getSupplements();
    return supplements.find((s) => s.id === id) || null;
  } catch (error) {
    console.error('Failed to get supplement by id:', error);
    return null;
  }
}

export async function reorderSupplements(supplementIds: string[]): Promise<void> {
  try {
    const supplements = await getSupplements();
    const reordered = supplementIds
      .map((id) => supplements.find((s) => s.id === id))
      .filter((s): s is Supplement => s !== undefined);
    await saveSupplements(reordered);
  } catch (error) {
    console.error('Failed to reorder supplements:', error);
    throw error;
  }
}
