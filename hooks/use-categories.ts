import { useState, useEffect, useCallback } from 'react';
import { Category, MAX_CATEGORIES } from '@/types/treatment';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/utils/category-storage';

type UseCategoriesResult = {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  canAddMore: boolean;
  refresh: () => Promise<void>;
  add: (label: string, color: string) => Promise<Category | null>;
  update: (id: string, updates: Partial<Pick<Category, 'label' | 'color'>>) => Promise<Category | null>;
  remove: (id: string) => Promise<boolean>;
  reorder: (categoryIds: string[]) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
};

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (label: string, color: string): Promise<Category | null> => {
    try {
      const newCategory = await addCategory(label, color);
      if (newCategory) {
        setCategories((prev) => [...prev, newCategory]);
      }
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add category'));
      throw err;
    }
  }, []);

  const update = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Category, 'label' | 'color'>>
    ): Promise<Category | null> => {
      try {
        const updated = await updateCategory(id, updates);
        if (updated) {
          setCategories((prev) =>
            prev.map((c) => (c.id === id ? updated : c))
          );
        }
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update category'));
        throw err;
      }
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await deleteCategory(id);
      if (success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete category'));
      throw err;
    }
  }, []);

  const reorder = useCallback(async (categoryIds: string[]): Promise<void> => {
    try {
      await reorderCategories(categoryIds);
      setCategories((prev) => {
        const reordered = categoryIds
          .map((id) => prev.find((c) => c.id === id))
          .filter((c): c is Category => c !== undefined);
        return reordered;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reorder categories'));
      throw err;
    }
  }, []);

  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  return {
    categories,
    loading,
    error,
    canAddMore: categories.length < MAX_CATEGORIES,
    refresh,
    add,
    update,
    remove,
    reorder,
    getCategoryById,
  };
}
