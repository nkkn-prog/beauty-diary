export type MonthlyStats = {
  month: string;  // 'YYYY-MM'
  count: number;
  totalExpense: number;
};

export type CategoryStats = {
  categoryId: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
  totalExpense: number;
};

export type StatsPeriod = '3months' | '6months' | '1year' | 'all';

export type OverviewStats = {
  totalTreatments: number;
  totalExpense: number;
  averageExpense: number;
};
