import { apiRequest } from './client';
import { Supplement } from '@/types/treatment';

type ApiSupplement = {
  id: string;
  name: string;
  emoji: string;
  url: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function toSupplement(api: ApiSupplement): Supplement {
  return {
    id: api.id,
    name: api.name,
    emoji: api.emoji,
    url: api.url ?? undefined,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export async function fetchSupplements(token: string): Promise<Supplement[]> {
  const data = await apiRequest<ApiSupplement[]>('/api/v1/supplements', { token });
  return data.map(toSupplement);
}

export async function createSupplement(
  token: string,
  input: { name: string; emoji: string; url?: string }
): Promise<Supplement> {
  const data = await apiRequest<ApiSupplement>('/api/v1/supplements', {
    method: 'POST',
    body: input,
    token,
  });
  return toSupplement(data);
}

export async function updateSupplement(
  token: string,
  id: string,
  updates: Partial<{ name: string; emoji: string; url: string | null }>
): Promise<Supplement> {
  const data = await apiRequest<ApiSupplement>(`/api/v1/supplements/${id}`, {
    method: 'PATCH',
    body: updates,
    token,
  });
  return toSupplement(data);
}

export async function deleteSupplement(token: string, id: string): Promise<void> {
  await apiRequest(`/api/v1/supplements/${id}`, {
    method: 'DELETE',
    token,
  });
}
