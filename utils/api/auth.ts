import { apiRequest } from './client';

interface SyncUserResponse {
  success: boolean;
  user: {
    id: string;
    createdAt: string;
  };
}

interface AuthStatusResponse {
  authenticated: boolean;
  clerkId?: string;
  user?: {
    id: string;
    createdAt: string;
    counts: {
      categories: number;
      treatments: number;
      supplements: number;
    };
  } | null;
  message?: string;
}

/**
 * ユーザーをデータベースに同期する
 * 認証後に呼び出してユーザーレコードを作成/確認する
 */
export async function syncUser(token: string): Promise<SyncUserResponse> {
  return apiRequest<SyncUserResponse>('/api/v1/auth/sync', {
    method: 'POST',
    token,
  });
}

/**
 * 認証状態とユーザー情報を取得
 */
export async function getAuthStatus(token: string): Promise<AuthStatusResponse> {
  return apiRequest<AuthStatusResponse>('/api/v1/auth/sync', {
    method: 'GET',
    token,
  });
}
