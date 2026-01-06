export type TreatmentCategory =
  | 'facial'      // フェイシャル
  | 'skin'        // 肌治療
  | 'hair'        // 脱毛
  | 'body'        // ボディ
  | 'nail'        // ネイル
  | 'eyebrow'     // 眉毛
  | 'other';      // その他

export type TreatmentStatus = 'scheduled' | 'completed' | 'cancelled';

export type Treatment = {
  id: string;
  title: string;
  date: string;          // ISO 8601 format: 'YYYY-MM-DD'
  time?: string;         // 'HH:mm' format
  location?: string;
  category: TreatmentCategory;
  price?: number;        // Price in JPY
  notes?: string;
  status: TreatmentStatus;
  createdAt: string;
  updatedAt: string;
};

export const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  facial: 'フェイシャル',
  skin: '肌治療',
  hair: '脱毛',
  body: 'ボディ',
  nail: 'ネイル',
  eyebrow: '眉毛',
  other: 'その他',
};

export const CATEGORY_COLORS: Record<TreatmentCategory, string> = {
  facial: '#E8B4B8',   // Soft pink
  skin: '#A8D5BA',     // Sage green
  hair: '#B4C7E8',     // Soft blue
  body: '#E8D4B4',     // Warm beige
  nail: '#D4B4E8',     // Lavender
  eyebrow: '#C7B299',  // Taupe
  other: '#C4C4C4',    // Gray
};
