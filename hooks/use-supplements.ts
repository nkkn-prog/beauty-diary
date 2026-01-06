import { useState, useEffect, useCallback } from 'react';
import { Supplement, MAX_SUPPLEMENTS } from '@/types/treatment';
import {
  getSupplements,
  addSupplement,
  updateSupplement,
  deleteSupplement,
  reorderSupplements,
} from '@/utils/supplement-storage';

type UseSupplementsResult = {
  supplements: Supplement[];
  loading: boolean;
  error: Error | null;
  canAddMore: boolean;
  refresh: () => Promise<void>;
  add: (name: string, emoji: string, url?: string) => Promise<Supplement | null>;
  update: (id: string, updates: Partial<Pick<Supplement, 'name' | 'emoji' | 'url'>>) => Promise<Supplement | null>;
  remove: (id: string) => Promise<boolean>;
  reorder: (supplementIds: string[]) => Promise<void>;
  getSupplementById: (id: string) => Supplement | undefined;
};

export function useSupplements(): UseSupplementsResult {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSupplements();
      setSupplements(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load supplements'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (name: string, emoji: string, url?: string): Promise<Supplement | null> => {
    try {
      const newSupplement = await addSupplement(name, emoji, url);
      if (newSupplement) {
        setSupplements((prev) => [...prev, newSupplement]);
      }
      return newSupplement;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add supplement'));
      throw err;
    }
  }, []);

  const update = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Supplement, 'name' | 'emoji' | 'url'>>
    ): Promise<Supplement | null> => {
      try {
        const updated = await updateSupplement(id, updates);
        if (updated) {
          setSupplements((prev) =>
            prev.map((s) => (s.id === id ? updated : s))
          );
        }
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update supplement'));
        throw err;
      }
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await deleteSupplement(id);
      if (success) {
        setSupplements((prev) => prev.filter((s) => s.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete supplement'));
      throw err;
    }
  }, []);

  const reorder = useCallback(async (supplementIds: string[]): Promise<void> => {
    try {
      await reorderSupplements(supplementIds);
      setSupplements((prev) => {
        const reordered = supplementIds
          .map((id) => prev.find((s) => s.id === id))
          .filter((s): s is Supplement => s !== undefined);
        return reordered;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reorder supplements'));
      throw err;
    }
  }, []);

  const getSupplementById = useCallback(
    (id: string): Supplement | undefined => {
      return supplements.find((s) => s.id === id);
    },
    [supplements]
  );

  return {
    supplements,
    loading,
    error,
    canAddMore: supplements.length < MAX_SUPPLEMENTS,
    refresh,
    add,
    update,
    remove,
    reorder,
    getSupplementById,
  };
}
