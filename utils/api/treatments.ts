import { apiRequest } from './client';
import { Treatment, TreatmentStatus, Category } from '@/types/treatment';

type ApiTreatmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

type ApiTreatment = {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  categoryId: string;
  price: number | null;
  notes: string | null;
  status: ApiTreatmentStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category;
};

function toStatus(api: ApiTreatmentStatus): TreatmentStatus {
  return api.toLowerCase() as TreatmentStatus;
}

function toApiStatus(status: TreatmentStatus): ApiTreatmentStatus {
  return status.toUpperCase() as ApiTreatmentStatus;
}

function toTreatment(api: ApiTreatment): Treatment {
  return {
    id: api.id,
    title: api.title,
    date: api.date,
    startTime: api.startTime ?? undefined,
    endTime: api.endTime ?? undefined,
    location: api.location ?? undefined,
    categoryId: api.categoryId,
    price: api.price ?? undefined,
    notes: api.notes ?? undefined,
    status: toStatus(api.status),
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export type FetchTreatmentsOptions = {
  date?: string;
  status?: TreatmentStatus;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
};

export async function fetchTreatments(
  token: string,
  options: FetchTreatmentsOptions = {}
): Promise<Treatment[]> {
  const params = new URLSearchParams();
  if (options.date) params.set('date', options.date);
  if (options.status) params.set('status', options.status);
  if (options.categoryId) params.set('categoryId', options.categoryId);
  if (options.startDate) params.set('startDate', options.startDate);
  if (options.endDate) params.set('endDate', options.endDate);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());

  const query = params.toString();
  const endpoint = `/api/v1/treatments${query ? `?${query}` : ''}`;
  const data = await apiRequest<ApiTreatment[]>(endpoint, { token });
  return data.map(toTreatment);
}

export type CreateTreatmentInput = {
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  categoryId: string;
  price?: number;
  notes?: string;
  status?: TreatmentStatus;
};

export async function createTreatment(
  token: string,
  input: CreateTreatmentInput
): Promise<Treatment> {
  const body = {
    ...input,
    status: input.status ? toApiStatus(input.status) : undefined,
  };
  const data = await apiRequest<ApiTreatment>('/api/v1/treatments', {
    method: 'POST',
    body,
    token,
  });
  return toTreatment(data);
}

export type UpdateTreatmentInput = Partial<CreateTreatmentInput>;

export async function updateTreatment(
  token: string,
  id: string,
  updates: UpdateTreatmentInput
): Promise<Treatment> {
  const body = {
    ...updates,
    status: updates.status ? toApiStatus(updates.status) : undefined,
  };
  const data = await apiRequest<ApiTreatment>(`/api/v1/treatments/${id}`, {
    method: 'PATCH',
    body,
    token,
  });
  return toTreatment(data);
}

export async function deleteTreatment(token: string, id: string): Promise<void> {
  await apiRequest(`/api/v1/treatments/${id}`, {
    method: 'DELETE',
    token,
  });
}
