import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, DEFAULT_CATEGORIES, MAX_CATEGORIES } from '@/types/treatment';

/**
 * セキュリティ注意事項:
 * AsyncStorageは暗号化されていません。
 * カテゴリデータは低機密性（ラベル、色のみ）のため現状許容していますが、
 * より機密性の高いデータを追加する場合はsecure-storage.tsへの移行を検討してください。
 */
const CATEGORIES_KEY = '@categories';

export async function getCategories(): Promise<Category[]> {
  try {
    const json = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (json) {
      return JSON.parse(json) as Category[];
    }
    // Initialize with default categories
    await saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Failed to get categories:', error);
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories:', error);
    throw error;
  }
}

export async function addCategory(label: string, color: string): Promise<Category | null> {
  try {
    const categories = await getCategories();
    if (categories.length >= MAX_CATEGORIES) {
      throw new Error(`Maximum ${MAX_CATEGORIES} categories allowed`);
    }

    // 入力値のサニタイズ
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      throw new Error('カテゴリ名を入力してください');
    }

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      label: trimmedLabel,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCategories([...categories, newCategory]);
    return newCategory;
  } catch (error) {
    console.error('Failed to add category:', error);
    throw error;
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<Pick<Category, 'label' | 'color'>>
): Promise<Category | null> {
  try {
    const categories = await getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return null;
    }

    // 入力値のサニタイズ
    const sanitizedUpdates = { ...updates };
    if (updates.label !== undefined) {
      sanitizedUpdates.label = updates.label.trim();
      if (!sanitizedUpdates.label) {
        throw new Error('カテゴリ名を入力してください');
      }
    }

    const updated: Category = {
      ...categories[index],
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString(),
    };

    categories[index] = updated;
    await saveCategories(categories);
    return updated;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const categories = await getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) {
      return false;
    }
    await saveCategories(filtered);
    return true;
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const categories = await getCategories();
    return categories.find((c) => c.id === id) || null;
  } catch (error) {
    console.error('Failed to get category by id:', error);
    return null;
  }
}

export async function reorderCategories(categoryIds: string[]): Promise<void> {
  try {
    const categories = await getCategories();
    const reordered = categoryIds
      .map((id) => categories.find((c) => c.id === id))
      .filter((c): c is Category => c !== undefined);
    await saveCategories(reordered);
  } catch (error) {
    console.error('Failed to reorder categories:', error);
    throw error;
  }
}
