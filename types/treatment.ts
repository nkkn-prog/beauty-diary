export type Category = {
  id: string;
  label: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type TreatmentStatus = 'scheduled' | 'completed' | 'cancelled';

export type Treatment = {
  id: string;
  title: string;
  date: string;          // ISO 8601 format: 'YYYY-MM-DD'
  startTime?: string;    // 'HH:mm' format
  endTime?: string;      // 'HH:mm' format
  location?: string;
  categoryId: string;    // Reference to Category.id
  price?: number;        // Price in JPY
  notes?: string;
  status: TreatmentStatus;
  createdAt: string;
  updatedAt: string;
};

export const COLOR_PALETTE = [
  '#E8B4B8',  // Soft Pink
  '#A8D5BA',  // Sage Green
  '#B4C7E8',  // Soft Blue
  '#E8D4B4',  // Warm Beige
  '#D4B4E8',  // Lavender
  '#C7B299',  // Taupe
  '#F5D0C5',  // Peach
  '#B8E0D2',  // Mint
  '#E8C4D4',  // Rose
  '#C4C4C4',  // Gray
] as const;

export const MAX_CATEGORIES = 10;

// Supplement types
export type Supplement = {
  id: string;
  name: string;
  emoji: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
};

export const MAX_SUPPLEMENTS = 10;

export const EMOJI_PALETTE = [
  '💊', '🍊', '💪', '✨', '☀️', '💎', '🌿', '🐟', '🦴', '🩸',
  '🧬', '🥛', '🍇', '🫀', '🧠', '👁️', '💅', '🦷', '🍃', '🌸',
] as const;

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'hair-removal',
    label: '脱毛',
    color: '#B4C7E8',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'peeling',
    label: 'ピーリング',
    color: '#A8D5BA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nail',
    label: 'ネイル',
    color: '#D4B4E8',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
