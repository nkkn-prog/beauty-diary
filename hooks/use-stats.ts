import { useMemo } from 'react';
import { useTreatments } from './use-treatments';
import { useCategories } from './use-categories';
import { MonthlyStats, CategoryStats, StatsPeriod, OverviewStats } from '@/types/stats';

function getStartDateForPeriod(period: StatsPeriod): string {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case '1year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      break;
    case 'all':
    default:
      return '2000-01-01';
  }

  return startDate.toISOString().split('T')[0];
}

type UseStatsResult = {
  loading: boolean;
  error: Error | null;
  overview: OverviewStats;
  monthlyStats: MonthlyStats[];
  categoryStats: CategoryStats[];
};

export function useStats(period: StatsPeriod = 'all'): UseStatsResult {
  const { treatments, loading: treatmentsLoading, error: treatmentsError } = useTreatments();
  const { categories, loading: categoriesLoading } = useCategories();

  const filteredTreatments = useMemo(() => {
    const startDate = getStartDateForPeriod(period);
    return treatments.filter(
      (t) => t.status === 'completed' && t.date >= startDate
    );
  }, [treatments, period]);

  const overview = useMemo((): OverviewStats => {
    const total = filteredTreatments.length;
    const totalExpense = filteredTreatments.reduce(
      (sum, t) => sum + (t.price || 0),
      0
    );
    const averageExpense = total > 0 ? Math.round(totalExpense / total) : 0;

    return {
      totalTreatments: total,
      totalExpense,
      averageExpense,
    };
  }, [filteredTreatments]);

  const monthlyStats = useMemo((): MonthlyStats[] => {
    const monthMap = new Map<string, { count: number; totalExpense: number }>();

    filteredTreatments.forEach((t) => {
      const month = t.date.substring(0, 7); // 'YYYY-MM'
      const existing = monthMap.get(month) || { count: 0, totalExpense: 0 };
      monthMap.set(month, {
        count: existing.count + 1,
        totalExpense: existing.totalExpense + (t.price || 0),
      });
    });

    return Array.from(monthMap.entries())
      .map(([month, stats]) => ({
        month,
        count: stats.count,
        totalExpense: stats.totalExpense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTreatments]);

  const categoryStats = useMemo((): CategoryStats[] => {
    const categoryMap = new Map<string, { count: number; totalExpense: number }>();

    filteredTreatments.forEach((t) => {
      const existing = categoryMap.get(t.categoryId) || {
        count: 0,
        totalExpense: 0,
      };
      categoryMap.set(t.categoryId, {
        count: existing.count + 1,
        totalExpense: existing.totalExpense + (t.price || 0),
      });
    });

    const total = filteredTreatments.length;

    return Array.from(categoryMap.entries())
      .map(([categoryId, stats]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          categoryId,
          label: category?.label || '不明',
          color: category?.color || '#C4C4C4',
          count: stats.count,
          percentage: total > 0 ? Math.round((stats.count / total) * 100) : 0,
          totalExpense: stats.totalExpense,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredTreatments, categories]);

  return {
    loading: treatmentsLoading || categoriesLoading,
    error: treatmentsError,
    overview,
    monthlyStats,
    categoryStats,
  };
}
