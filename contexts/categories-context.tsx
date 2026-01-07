import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { Category, MAX_CATEGORIES } from '@/types/treatment';
import {
  fetchCategories,
  createCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from '@/utils/api/categories';

type CategoriesContextType = {
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

const CategoriesContext = createContext<CategoriesContextType | null>(null);

function sortCategoriesWithOtherLast(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    if (a.label === 'その他') return 1;
    if (b.label === 'その他') return -1;
    return 0;
  });
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasLoaded = useRef(false);

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await fetchCategories(token);
      setCategories(sortCategoriesWithOtherLast(data));
      hasLoaded.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      setCategories([]);
      hasLoaded.current = false;
      return;
    }
    if (hasLoaded.current) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const data = await fetchCategories(token);
        setCategories(sortCategoriesWithOtherLast(data));
        hasLoaded.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load categories'));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const add = useCallback(async (label: string, color: string): Promise<Category | null> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const newCategory = await createCategory(token, { label, color });
      setCategories((prev) => {
        const otherIndex = prev.findIndex((c) => c.label === 'その他');
        if (otherIndex === -1) {
          return [...prev, newCategory];
        }
        const newList = [...prev];
        newList.splice(otherIndex, 0, newCategory);
        return newList;
      });
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add category'));
      throw err;
    }
  }, [getToken]);

  const update = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Category, 'label' | 'color'>>
    ): Promise<Category | null> => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const updated = await apiUpdateCategory(token, id, updates);
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? updated : c))
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update category'));
        throw err;
      }
    },
    [getToken]
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await apiDeleteCategory(token, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete category'));
      throw err;
    }
  }, [getToken]);

  const reorder = useCallback(async (categoryIds: string[]): Promise<void> => {
    setCategories((prev) => {
      const reordered = categoryIds
        .map((id) => prev.find((c) => c.id === id))
        .filter((c): c is Category => c !== undefined);
      return reordered;
    });
  }, []);

  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  const value: CategoriesContextType = {
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

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextType {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
