import { useAuth } from '@clerk/clerk-expo';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Supplement, MAX_SUPPLEMENTS } from '@/types/treatment';
import {
  fetchSupplements,
  createSupplement,
  updateSupplement as apiUpdateSupplement,
  deleteSupplement as apiDeleteSupplement,
} from '@/utils/api/supplements';

type UseSupplementsResult = {
  supplements: Supplement[];
  loading: boolean;
  error: Error | null;
  canAddMore: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  add: (name: string, emoji: string, url?: string) => Promise<Supplement | null>;
  update: (id: string, updates: Partial<Pick<Supplement, 'name' | 'emoji' | 'url'>>) => Promise<Supplement | null>;
  remove: (id: string) => Promise<boolean>;
  reorder: (supplementIds: string[]) => Promise<void>;
  getSupplementById: (id: string) => Supplement | undefined;
};

export function useSupplements(): UseSupplementsResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
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
      const data = await fetchSupplements(token);
      setSupplements(data);
      hasLoaded.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load supplements'));
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
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
        const data = await fetchSupplements(token);
        setSupplements(data);
        hasLoaded.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load supplements'));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const add = useCallback(async (name: string, emoji: string, url?: string): Promise<Supplement | null> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const newSupplement = await createSupplement(token, { name, emoji, url });
      setSupplements((prev) => [...prev, newSupplement]);
      return newSupplement;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add supplement'));
      throw err;
    }
  }, [getToken]);

  const update = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Supplement, 'name' | 'emoji' | 'url'>>
    ): Promise<Supplement | null> => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const updated = await apiUpdateSupplement(token, id, updates);
        setSupplements((prev) =>
          prev.map((s) => (s.id === id ? updated : s))
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update supplement'));
        throw err;
      }
    },
    [getToken]
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await apiDeleteSupplement(token, id);
      setSupplements((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete supplement'));
      throw err;
    }
  }, [getToken]);

  const reorder = useCallback(async (supplementIds: string[]): Promise<void> => {
    // Note: Reorder is now client-side only since API doesn't have batch update
    setSupplements((prev) => {
      const reordered = supplementIds
        .map((id) => prev.find((s) => s.id === id))
        .filter((s): s is Supplement => s !== undefined);
      return reordered;
    });
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
