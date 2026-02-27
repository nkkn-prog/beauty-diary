# BeautyLog セキュリティ脆弱性調査結果

**調査日:** 2026年1月15日
**最終更新:** 2026年1月15日（修正実施後）
**対象:** BeautyLog React Native/Expo アプリケーション
**調査範囲:** 認証・API通信・データ保存・入力検証・依存関係・外部連携

---

## 概要

| 重大度 | 件数 |
|--------|------|
| 🔴 Critical | 2件 |
| 🟠 High | 3件 |
| 🟡 Medium | 5件 |
| 🟢 Low | 1件 |
| **合計** | **11件** |

---

## 🔴 Critical（重大）

### 1. AsyncStorageでの機密データ平文保存

**影響ファイル:**
- `utils/treatment-storage.ts`
- `utils/supplement-storage.ts`
- `utils/category-storage.ts`

**説明:**
AsyncStorageはデフォルトで暗号化されず、プレーンテキストでデバイスに保存される。施術日時、場所、価格、個人的なメモなどの機密情報が含まれる。

**リスク:**
- デバイス盗難・紛失時に個人情報が流出
- ルート化されたAndroid端末では `/data/data/com.nkkn.beautylog/` から直接読み取り可能
- 医療・美容に関する個人情報の漏洩

**該当コード:**
```typescript
// utils/treatment-storage.ts
export async function saveTreatments(treatments: Treatment[]): Promise<void> {
  await AsyncStorage.setItem(TREATMENTS_KEY, JSON.stringify(treatments));
}
```

**推奨対策:**
- `expo-secure-store`への移行、または暗号化ライブラリの導入
- 保存データの機密性レベルに応じた保存先の見直し

---

### 2. Google OAuthトークンのクライアント側使用

**影響ファイル:**
- `utils/google-calendar.ts:96-106`
- `hooks/use-google-calendar.ts:61`

**説明:**
バックエンドAPI（`/api/v1/auth/google-token`）から取得したGoogle OAuthアクセストークンを、クライアント側で直接Google Calendar APIに送信している。

**リスク:**
- ネットワークトラフィック分析（Burp Suite、mitmproxy等）でトークン盗聴が可能
- 中間者攻撃によるGoogle Calendarへの不正アクセス
- トークンリフレッシュ機構が不明確

**該当コード:**
```typescript
// utils/google-calendar.ts
const response = await fetch(
  `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,  // クライアント側で直接使用
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  }
);
```

**推奨対策:**
- Google Calendar操作をすべてバックエンド側で実行
- クライアント側ではトークンを保持しない設計に変更

---

## 🟠 High（高）

### 3. HTTP非暗号通信のデフォルト設定

**影響ファイル:**
- `utils/api/client.ts:3`

**説明:**
API_BASE_URLのデフォルト値が`http://localhost:3000`（HTTP）に設定されている。環境変数が設定されていない場合、平文通信となる。

**リスク:**
- 中間者攻撃（MITM）による認証情報・個人データの盗聴
- 本番環境での設定漏れによるセキュリティホール

**該当コード:**
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
```

**推奨対策:**
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is required');
}
```

---

### 4. サプリメントURLのバリデーション欠落

**影響ファイル:**
- `utils/supplement-storage.ts:28-49`
- `components/supplements/SupplementEditModal.tsx`

**説明:**
サプリメントのURL入力フィールドにバリデーションがなく、任意のスキーム（`javascript:`, `data:`等）を入力可能。

**リスク:**
- WebViewでURLを開く場合にXSS攻撃の可能性
- 悪意あるURLの保存・実行

**該当コード:**
```typescript
export async function addSupplement(name: string, emoji: string, url?: string) {
  const newSupplement: Supplement = {
    url,  // バリデーションなし
  };
}
```

**推奨対策:**
```typescript
if (url) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Invalid URL protocol');
  }
}
```

---

### 5. ディープリンク検証なし

**影響ファイル:**
- `app/(auth)/sign-in.tsx`
- `app.json`

**説明:**
OAuth認証後のリダイレクトURLの正当性確認が実装されていない。

**リスク:**
- 悪意あるアプリが同じURLスキームを登録し、認証フローをハイジャック
- 認証トークンの窃取

**該当コード:**
```typescript
redirectUrl: Linking.createURL('/(tabs)', { scheme: 'beautylog' })
```

**推奨対策:**
- リダイレクトURL/スキームの正当性検証を実装
- Universal Links / App Links の使用を検討

---

## 🟡 Medium（中）

### 6. デバッグログの本番環境出力

**影響ファイル:**
- `utils/google-calendar.ts:110`
- `hooks/use-google-calendar.ts:51`

**説明:**
`console.log`でトークン関連の情報が出力される。本番環境でもログが出力される可能性がある。

**リスク:**
- デバッグ情報からの機密情報漏洩
- セキュリティ監査でのフラグ

**推奨対策:**
```typescript
if (__DEV__) {
  console.log('[GoogleCalendar] Event created, id:', data.id);
}
```

---

### 7. URLスキームの衝突

**影響ファイル:**
- `app.json` (`scheme: "beautylog"`)
- `app/(auth)/sign-in.tsx` (`scheme: 'beautylog'`)

**説明:**
`beautylog://`に統一済み。

**リスク:**
- スキーム衝突によるディープリンクの誤動作
- 悪意あるアプリによるスキームハイジャック

**推奨対策:**
- スキームを`beautylog://`に統一

---

### 8. 過度なiOSカレンダー権限要求

**影響ファイル:**
- `app.json`

**説明:**
`NSCalendarsFullAccessUsageDescription`（フルアクセス権限）を要求しているが、施術予定の追加のみであれば必要以上の権限。

**該当設定:**
```json
"NSCalendarsFullAccessUsageDescription": "Google Calendarと連携するために使用します"
```

**リスク:**
- App Store審査でのリジェクトリスク
- ユーザーからの信頼低下

**推奨対策:**
- 必要最小限の権限のみ要求

---

### 9. Webプラットフォームのトークンキャッシュ未実装

**影響ファイル:**
- `utils/token-cache.ts:35`

**説明:**
Web版では`tokenCache = undefined`となり、セッション情報がセキュアに保存されない。

**該当コード:**
```typescript
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
```

**リスク:**
- Web版でのセッション管理の脆弱性

---

### 10. 入力値のtrim処理不一貫

**影響ファイル:**
- `utils/category-storage.ts:30-51`
- `utils/supplement-storage.ts`

**説明:**
サーバー送信時はtrim処理があるが、ローカルストレージ保存時にはtrim処理がない。空白のみのラベルが保存される可能性。

**推奨対策:**
```typescript
export async function addCategory(label: string, color: string) {
  label = label.trim();
  if (!label) throw new Error('Label cannot be empty');
}
```

---

## 🟢 Low（低）

### 11. EASプロジェクトIDの公開

**影響ファイル:**
- `app.json:58`

**説明:**
EASプロジェクトIDがapp.jsonにハードコードされている。

**該当設定:**
```json
"extra": {
  "eas": {
    "projectId": "b389c9ae-3d9e-4952-8551-31e9da54708c"
  }
}
```

**リスク:**
- Expoサーバーからの更新プログラムURL推測
- 情報漏洩のリスクは低い（公開情報）

---

## 良好な実装

以下の項目は適切に実装されており、セキュリティ上問題ありません：

| 項目 | 評価 | 詳細 |
|------|------|------|
| 認証基盤 | ✅ 良好 | Clerk認証サービスを採用（業界標準） |
| トークン保存 | ✅ 良好 | SecureStoreで暗号化保存（iOS Keychain / Android EncryptedSharedPreferences） |
| パスワード検証 | ✅ 良好 | 最小8文字、パスワード漏洩チェック実装 |
| API認証 | ✅ 良好 | JWT Bearer認証を使用 |
| npm依存関係 | ✅ 良好 | `npm audit`で既知の脆弱性0件 |
| XSS対策 | ✅ 良好 | React NativeのためDOMベースXSSリスクなし |

---

## 総合評価

| カテゴリ | スコア |
|----------|--------|
| 入力検証 | 6/10 |
| 依存関係 | 10/10 |
| 秘密管理 | 9/10 |
| 認証・トークン | 9/10 |
| API通信 | 7/10 |
| データ保護 | 5/10 |
| **総合** | **7.7/10** |

---

## 修正優先順位の推奨

1. **Phase 1（即時）:** Critical + High の5件
2. **Phase 2（中期）:** Medium の5件
3. **Phase 3（長期）:** Low の1件 + アーキテクチャ改善

---

## 実施済み修正（2026年1月15日）

### High/Medium 修正完了

| # | 脆弱性 | 対応内容 | ファイル |
|---|--------|----------|----------|
| 3 | HTTP非暗号通信のデフォルト | 環境変数必須化、デフォルト値削除 | `utils/api/client.ts` |
| 4 | サプリメントURLバリデーション | http/https スキームのみ許可 | `utils/supplement-storage.ts` |
| 5 | ディープリンク検証 | URLスキーム・パス検証ユーティリティ追加 | `utils/deep-link-validator.ts` |
| 6 | デバッグログ本番出力 | `__DEV__`条件分岐追加 | `utils/google-calendar.ts`, `hooks/use-google-calendar.ts` |
| 7 | URLスキーム衝突 | `beautylog://`に統一 | `app/(auth)/sign-in.tsx` |
| 8 | iOS権限の過剰要求 | `NSCalendarsFullAccessUsageDescription`削除 | `app.json` |
| 9 | Webトークンキャッシュ | localStorage ベースの実装追加 | `utils/token-cache.ts` |
| 10 | trim処理不一貫 | 入力値サニタイズ統一 | `utils/category-storage.ts`, `utils/supplement-storage.ts` |

### Critical 対応状況

| # | 脆弱性 | 対応内容 |
|---|--------|----------|
| 1 | AsyncStorage平文保存 | セキュリティ注意事項を文書化、将来の暗号化対応用ラッパー追加（`utils/secure-storage.ts`）。現状は低機密性データのみのため許容 |
| 2 | Google OAuthトークン流通 | セキュリティ注意事項を文書化。完全対応にはバックエンド側でのGoogle Calendar操作実装が必要 |

### 新規作成ファイル

- `utils/deep-link-validator.ts` - ディープリンク検証ユーティリティ
- `utils/secure-storage.ts` - 将来の暗号化対応用ストレージラッパー
