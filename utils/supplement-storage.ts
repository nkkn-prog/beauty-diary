import AsyncStorage from '@react-native-async-storage/async-storage';
import { Supplement, MAX_SUPPLEMENTS } from '@/types/treatment';

const SUPPLEMENTS_KEY = '@supplements';

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

    const newSupplement: Supplement = {
      id: `supplement-${Date.now()}`,
      name,
      emoji,
      url,
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

    const updated: Supplement = {
      ...supplements[index],
      ...updates,
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
