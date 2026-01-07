import { apiRequest } from './client';
import { BeforeAfterPhoto, CreatePhotoInput, PhotoType } from '@/types/photo';

type ApiPhoto = {
  id: string;
  type: 'BEFORE' | 'AFTER';
  assetId: string;
  uri: string;
  date: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

function toPhotoType(api: 'BEFORE' | 'AFTER'): PhotoType {
  return api.toLowerCase() as PhotoType;
}

function toApiPhotoType(type: PhotoType): 'BEFORE' | 'AFTER' {
  return type.toUpperCase() as 'BEFORE' | 'AFTER';
}

function toPhoto(api: ApiPhoto): BeforeAfterPhoto {
  return {
    id: api.id,
    type: toPhotoType(api.type),
    assetId: api.assetId,
    uri: api.uri,
    date: api.date,
    memo: api.memo ?? undefined,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export type FetchPhotosOptions = {
  type?: PhotoType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
};

export async function fetchPhotos(
  token: string,
  options: FetchPhotosOptions = {}
): Promise<BeforeAfterPhoto[]> {
  const params = new URLSearchParams();
  if (options.type) params.set('type', options.type);
  if (options.startDate) params.set('startDate', options.startDate);
  if (options.endDate) params.set('endDate', options.endDate);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());

  const query = params.toString();
  const endpoint = `/api/v1/photos${query ? `?${query}` : ''}`;

  const data = await apiRequest<ApiPhoto[]>(endpoint, { token });
  return data.map(toPhoto);
}

export async function createPhoto(
  token: string,
  input: CreatePhotoInput
): Promise<BeforeAfterPhoto> {
  const body = {
    ...input,
    type: toApiPhotoType(input.type),
  };
  const data = await apiRequest<ApiPhoto>('/api/v1/photos', {
    method: 'POST',
    body,
    token,
  });
  return toPhoto(data);
}

export async function deletePhoto(token: string, id: string): Promise<void> {
  await apiRequest(`/api/v1/photos/${id}`, {
    method: 'DELETE',
    token,
  });
}
