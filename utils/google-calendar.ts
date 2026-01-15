import { Treatment } from '@/types/treatment';

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * セキュリティ注意事項:
 *
 * 現在の実装では、Google OAuthアクセストークンがバックエンドからクライアントに渡され、
 * クライアントから直接Google Calendar APIを呼び出しています。
 *
 * 推奨される改善:
 * 1. Google Calendar操作をすべてバックエンド側で実行する
 * 2. クライアントはバックエンドAPIを通じて間接的にカレンダー操作を行う
 * 3. これにより、トークンがクライアント側に露出することを防げる
 *
 * TODO: バックエンドにGoogle Calendar操作エンドポイントを追加し、
 * クライアント側のトークン使用を廃止する
 */

export type GoogleCalendarEvent = {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
};

export type CreateEventResult = {
  success: boolean;
  eventId?: string;
  error?: string;
};

/**
 * 日付と時刻文字列からISO形式の日時を作成
 */
function createDateTimeString(date: string, time?: string): string {
  const [year, month, day] = date.split('-').map(Number);
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    const dt = new Date(year, month - 1, day, hours, minutes);
    return dt.toISOString();
  }
  return `${date}T00:00:00`;
}

/**
 * TreatmentからGoogle Calendar用のイベントオブジェクトを作成
 */
export function treatmentToCalendarEvent(treatment: Treatment): GoogleCalendarEvent {
  const isAllDay = !treatment.startTime;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (isAllDay) {
    return {
      summary: treatment.title,
      description: treatment.notes,
      location: treatment.location,
      start: {
        date: treatment.date,
      },
      end: {
        date: treatment.date,
      },
    };
  }

  const startDateTime = createDateTimeString(treatment.date, treatment.startTime);
  let endDateTime: string;

  if (treatment.endTime) {
    endDateTime = createDateTimeString(treatment.date, treatment.endTime);
  } else {
    // 終了時刻が未設定の場合は1時間後
    const startDate = new Date(startDateTime);
    endDateTime = new Date(startDate.getTime() + 60 * 60 * 1000).toISOString();
  }

  return {
    summary: treatment.title,
    description: treatment.notes,
    location: treatment.location,
    start: {
      dateTime: startDateTime,
      timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone,
    },
  };
}

/**
 * Google Calendar APIにイベントを作成
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEvent
): Promise<CreateEventResult> {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (__DEV__) {
        console.error('[GoogleCalendar] API error:', response.status, errorData);
      }

      if (response.status === 401) {
        return { success: false, error: 'token_expired' };
      }
      if (response.status === 403) {
        return { success: false, error: 'permission_denied' };
      }
      return { success: false, error: 'api_error' };
    }

    const data = await response.json();
    if (__DEV__) {
      console.log('[GoogleCalendar] Event created, id:', data.id);
    }
    return { success: true, eventId: data.id };
  } catch (error) {
    if (__DEV__) {
      console.error('[GoogleCalendar] Network error:', error);
    }
    return { success: false, error: 'network_error' };
  }
}

/**
 * 施術をGoogle Calendarに追加
 */
export async function addTreatmentToGoogleCalendar(
  accessToken: string,
  treatment: Treatment
): Promise<CreateEventResult> {
  const event = treatmentToCalendarEvent(treatment);
  return createGoogleCalendarEvent(accessToken, event);
}

export type DeleteEventResult = {
  success: boolean;
  error?: string;
};

/**
 * Google CalendarからイベントをID指定で削除
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<DeleteEventResult> {
  try {
    if (__DEV__) {
      console.log('[GoogleCalendar] Deleting event:', eventId);
    }

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (__DEV__) {
      console.log('[GoogleCalendar] Delete response status:', response.status);
    }

    // 204 No Content = success, 410 Gone = already deleted
    if (response.ok || response.status === 204 || response.status === 410) {
      if (__DEV__) {
        console.log('[GoogleCalendar] Event deleted successfully, status:', response.status);
      }
      return { success: true };
    }

    const errorData = await response.json().catch(() => ({}));
    if (__DEV__) {
      console.error('[GoogleCalendar] Delete error:', errorData);
    }

    if (response.status === 401) {
      return { success: false, error: 'token_expired' };
    }
    if (response.status === 403) {
      return { success: false, error: 'permission_denied' };
    }
    if (response.status === 404) {
      // Event not found - treat as success since it doesn't exist
      return { success: true };
    }
    return { success: false, error: 'api_error' };
  } catch (error) {
    if (__DEV__) {
      console.error('[GoogleCalendar] Network error:', error);
    }
    return { success: false, error: 'network_error' };
  }
}

export const GOOGLE_CALENDAR_ERROR_MESSAGES: Record<string, string> = {
  token_expired:
    'Googleの認証が切れました。再度ログインしてください。',
  permission_denied:
    'Google Calendarへのアクセスが許可されていません。Googleアカウントで再度ログインしてください。',
  api_error:
    'Google Calendarへの追加に失敗しました。もう一度お試しください。',
  network_error:
    'ネットワークエラーが発生しました。接続を確認してください。',
  not_google_user:
    'この機能を使用するには、Googleアカウントでログインしてください。',
  unknown_error:
    'エラーが発生しました。もう一度お試しください。',
};

export function getGoogleCalendarErrorMessage(errorCode: string): string {
  return (
    GOOGLE_CALENDAR_ERROR_MESSAGES[errorCode] ??
    GOOGLE_CALENDAR_ERROR_MESSAGES.unknown_error
  );
}
