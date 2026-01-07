import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { Treatment } from '@/types/treatment';
import {
  fetchTreatments,
  createTreatment,
  updateTreatment as apiUpdateTreatment,
  deleteTreatment as apiDeleteTreatment,
  CreateTreatmentInput,
  UpdateTreatmentInput,
} from '@/utils/api/treatments';

/**
 * 施術予定が過去かどうかを判定する
 * - 日付が過去の場合: true
 * - 日付が今日で終了時刻が過去の場合: true
 * - 日付が今日で終了時刻がなく開始時刻が過去の場合: true
 * - 日付が今日で時刻が設定されていない場合: false（当日中は予定のまま）
 */
function isTreatmentPastDue(treatment: Treatment): boolean {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // 日付が過去
  if (treatment.date < today) {
    return true;
  }

  // 日付が今日の場合、時刻で判定
  if (treatment.date === today) {
    // 終了時刻がある場合は終了時刻で判定
    if (treatment.endTime) {
      return treatment.endTime < currentTime;
    }
    // 開始時刻のみの場合は開始時刻で判定
    if (treatment.startTime) {
      return treatment.startTime < currentTime;
    }
    // 時刻が設定されていない場合は当日中は過去扱いにしない
    return false;
  }

  return false;
}

type TreatmentsContextType = {
  treatments: Treatment[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  add: (input: CreateTreatmentInput) => Promise<Treatment>;
  update: (id: string, updates: UpdateTreatmentInput) => Promise<Treatment | null>;
  remove: (id: string) => Promise<boolean>;
  getTreatmentById: (id: string) => Treatment | undefined;
  getByDate: (date: string) => Treatment[];
  getUpcoming: (limit?: number) => Treatment[];
};

const TreatmentsContext = createContext<TreatmentsContextType | null>(null);

export function TreatmentsProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasLoaded = useRef(false);

  // 過去の「予定」ステータスの施術を自動的に「完了」に更新
  const autoCompletePastTreatments = useCallback(async (
    token: string,
    treatmentList: Treatment[]
  ): Promise<Treatment[]> => {
    const pastScheduled = treatmentList.filter(
      (t) => t.status === 'scheduled' && isTreatmentPastDue(t)
    );

    if (pastScheduled.length === 0) {
      return treatmentList;
    }

    // バックグラウンドで更新（エラーは無視）
    const updatePromises = pastScheduled.map(async (t) => {
      try {
        return await apiUpdateTreatment(token, t.id, { status: 'completed' });
      } catch {
        return null;
      }
    });

    const results = await Promise.all(updatePromises);
    const updatedMap = new Map<string, Treatment>();
    results.forEach((result) => {
      if (result) {
        updatedMap.set(result.id, result);
      }
    });

    // ローカルステートを更新
    return treatmentList.map((t) => updatedMap.get(t.id) || t);
  }, []);

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }
    try {
      // Don't set loading to true on refresh to avoid flicker
      setError(null);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await fetchTreatments(token);
      const processed = await autoCompletePastTreatments(token, data);
      setTreatments(processed);
      hasLoaded.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load treatments'));
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn, autoCompletePastTreatments]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      setTreatments([]);
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
        const data = await fetchTreatments(token);
        const processed = await autoCompletePastTreatments(token, data);
        setTreatments(processed);
        hasLoaded.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load treatments'));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const add = useCallback(async (input: CreateTreatmentInput): Promise<Treatment> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const newTreatment = await createTreatment(token, input);
      setTreatments((prev) => [...prev, newTreatment]);
      return newTreatment;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add treatment'));
      throw err;
    }
  }, [getToken]);

  const update = useCallback(
    async (id: string, updates: UpdateTreatmentInput): Promise<Treatment | null> => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const updated = await apiUpdateTreatment(token, id, updates);
        setTreatments((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update treatment'));
        throw err;
      }
    },
    [getToken]
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await apiDeleteTreatment(token, id);
      setTreatments((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete treatment'));
      throw err;
    }
  }, [getToken]);

  const getTreatmentById = useCallback(
    (id: string): Treatment | undefined => {
      return treatments.find((t) => t.id === id);
    },
    [treatments]
  );

  const getByDate = useCallback(
    (date: string): Treatment[] => {
      return treatments
        .filter((t) => t.date === date)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    },
    [treatments]
  );

  const getUpcoming = useCallback(
    (limit?: number): Treatment[] => {
      const today = new Date().toISOString().split('T')[0];
      const upcoming = treatments
        .filter((t) => t.date >= today && t.status === 'scheduled')
        .sort((a, b) => {
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
      return limit ? upcoming.slice(0, limit) : upcoming;
    },
    [treatments]
  );

  const value: TreatmentsContextType = {
    treatments,
    loading,
    error,
    refresh,
    add,
    update,
    remove,
    getTreatmentById,
    getByDate,
    getUpcoming,
  };

  return (
    <TreatmentsContext.Provider value={value}>
      {children}
    </TreatmentsContext.Provider>
  );
}

export function useTreatments(): TreatmentsContextType {
  const context = useContext(TreatmentsContext);
  if (!context) {
    throw new Error('useTreatments must be used within a TreatmentsProvider');
  }
  return context;
}
