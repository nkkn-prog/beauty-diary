import { apiRequest } from './client';
import { Category } from '@/types/treatment';

type ApiCategory = {
  id: string;
  label: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function toCategory(api: ApiCategory): Category {
  return {
    id: api.id,
    label: api.label,
    color: api.color,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export async function fetchCategories(token: string): Promise<Category[]> {
  const data = await apiRequest<ApiCategory[]>('/api/v1/categories', { token });
  return data.map(toCategory);
}

export async function createCategory(
  token: string,
  input: { label: string; color: string }
): Promise<Category> {
  const data = await apiRequest<ApiCategory>('/api/v1/categories', {
    method: 'POST',
    body: input,
    token,
  });
  return toCategory(data);
}

export async function updateCategory(
  token: string,
  id: string,
  updates: Partial<{ label: string; color: string }>
): Promise<Category> {
  const data = await apiRequest<ApiCategory>(`/api/v1/categories/${id}`, {
    method: 'PATCH',
    body: updates,
    token,
  });
  return toCategory(data);
}

export async function deleteCategory(token: string, id: string): Promise<void> {
  await apiRequest(`/api/v1/categories/${id}`, {
    method: 'DELETE',
    token,
  });
}
