import { useAuth } from '@clerk/clerk-expo';
import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyNote } from '@/types/treatment';
import {
  fetchDailyNotes,
  createDailyNote,
  updateDailyNote as apiUpdateDailyNote,
  deleteDailyNote as apiDeleteDailyNote,
} from '@/utils/api/daily-notes';

type UseDailyNotesResult = {
  notes: DailyNote[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  save: (date: string, memo: string) => Promise<DailyNote>;
  remove: (id: string) => Promise<boolean>;
  getByDate: (date: string) => DailyNote | undefined;
};

export function useDailyNotes(): UseDailyNotesResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [notes, setNotes] = useState<DailyNote[]>([]);
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
      const data = await fetchDailyNotes(token);
      setNotes(data);
      hasLoaded.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load daily notes'));
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
        const data = await fetchDailyNotes(token);
        setNotes(data);
        hasLoaded.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load daily notes'));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const getByDate = useCallback(
    (date: string): DailyNote | undefined => {
      return notes.find((n) => n.date === date);
    },
    [notes]
  );

  const save = useCallback(
    async (date: string, memo: string): Promise<DailyNote> => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const existingNote = notes.find((n) => n.date === date);

        if (existingNote) {
          // Update existing note
          const updated = await apiUpdateDailyNote(token, existingNote.id, { memo });
          setNotes((prev) =>
            prev.map((n) => (n.id === existingNote.id ? updated : n))
          );
          return updated;
        } else {
          // Create new note
          const newNote = await createDailyNote(token, { date, memo });
          setNotes((prev) => [...prev, newNote]);
          return newNote;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save daily note'));
        throw err;
      }
    },
    [getToken, notes]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        await apiDeleteDailyNote(token, id);
        setNotes((prev) => prev.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete daily note'));
        throw err;
      }
    },
    [getToken]
  );

  return {
    notes,
    loading,
    error,
    refresh,
    save,
    remove,
    getByDate,
  };
}
