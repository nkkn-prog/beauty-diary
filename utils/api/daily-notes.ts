import { apiRequest } from './client';
import { DailyNote } from '@/types/treatment';

type ApiDailyNote = {
  id: string;
  date: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

function toDailyNote(api: ApiDailyNote): DailyNote {
  return {
    id: api.id,
    date: api.date,
    memo: api.memo,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export async function fetchDailyNotes(token: string): Promise<DailyNote[]> {
  const data = await apiRequest<ApiDailyNote[]>('/api/v1/daily-notes', { token });
  return data.map(toDailyNote);
}

export async function fetchDailyNoteByDate(
  token: string,
  date: string
): Promise<DailyNote | null> {
  try {
    const data = await apiRequest<ApiDailyNote>(`/api/v1/daily-notes/date/${date}`, {
      token,
    });
    return toDailyNote(data);
  } catch {
    return null;
  }
}

export type CreateDailyNoteInput = {
  date: string;
  memo: string;
};

export async function createDailyNote(
  token: string,
  input: CreateDailyNoteInput
): Promise<DailyNote> {
  const data = await apiRequest<ApiDailyNote>('/api/v1/daily-notes', {
    method: 'POST',
    body: input,
    token,
  });
  return toDailyNote(data);
}

export type UpdateDailyNoteInput = {
  memo: string;
};

export async function updateDailyNote(
  token: string,
  id: string,
  updates: UpdateDailyNoteInput
): Promise<DailyNote> {
  const data = await apiRequest<ApiDailyNote>(`/api/v1/daily-notes/${id}`, {
    method: 'PATCH',
    body: updates,
    token,
  });
  return toDailyNote(data);
}

export async function deleteDailyNote(token: string, id: string): Promise<void> {
  await apiRequest(`/api/v1/daily-notes/${id}`, {
    method: 'DELETE',
    token,
  });
}
