import AsyncStorage from '@react-native-async-storage/async-storage';
import { Treatment, TreatmentStatus } from '@/types/treatment';

const TREATMENTS_KEY = '@treatments';

export type TreatmentInput = Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>;
export type TreatmentUpdate = Partial<Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>>;

export async function getTreatments(): Promise<Treatment[]> {
  try {
    const json = await AsyncStorage.getItem(TREATMENTS_KEY);
    if (json) {
      return JSON.parse(json) as Treatment[];
    }
    return [];
  } catch (error) {
    console.error('Failed to get treatments:', error);
    return [];
  }
}

export async function saveTreatments(treatments: Treatment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TREATMENTS_KEY, JSON.stringify(treatments));
  } catch (error) {
    console.error('Failed to save treatments:', error);
    throw error;
  }
}

export async function addTreatment(input: TreatmentInput): Promise<Treatment> {
  try {
    const treatments = await getTreatments();
    const newTreatment: Treatment = {
      ...input,
      id: `treatment-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveTreatments([...treatments, newTreatment]);
    return newTreatment;
  } catch (error) {
    console.error('Failed to add treatment:', error);
    throw error;
  }
}

export async function updateTreatment(
  id: string,
  updates: TreatmentUpdate
): Promise<Treatment | null> {
  try {
    const treatments = await getTreatments();
    const index = treatments.findIndex((t) => t.id === id);
    if (index === -1) {
      return null;
    }

    const updated: Treatment = {
      ...treatments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    treatments[index] = updated;
    await saveTreatments(treatments);
    return updated;
  } catch (error) {
    console.error('Failed to update treatment:', error);
    throw error;
  }
}

export async function deleteTreatment(id: string): Promise<boolean> {
  try {
    const treatments = await getTreatments();
    const filtered = treatments.filter((t) => t.id !== id);
    if (filtered.length === treatments.length) {
      return false;
    }
    await saveTreatments(filtered);
    return true;
  } catch (error) {
    console.error('Failed to delete treatment:', error);
    throw error;
  }
}

export async function getTreatmentById(id: string): Promise<Treatment | null> {
  try {
    const treatments = await getTreatments();
    return treatments.find((t) => t.id === id) || null;
  } catch (error) {
    console.error('Failed to get treatment by id:', error);
    return null;
  }
}

export async function getTreatmentsByDate(date: string): Promise<Treatment[]> {
  try {
    const treatments = await getTreatments();
    return treatments.filter((t) => t.date === date);
  } catch (error) {
    console.error('Failed to get treatments by date:', error);
    return [];
  }
}

export async function getTreatmentsByCategory(categoryId: string): Promise<Treatment[]> {
  try {
    const treatments = await getTreatments();
    return treatments.filter((t) => t.categoryId === categoryId);
  } catch (error) {
    console.error('Failed to get treatments by category:', error);
    return [];
  }
}

export async function getTreatmentsByStatus(status: TreatmentStatus): Promise<Treatment[]> {
  try {
    const treatments = await getTreatments();
    return treatments.filter((t) => t.status === status);
  } catch (error) {
    console.error('Failed to get treatments by status:', error);
    return [];
  }
}

export async function getUpcomingTreatments(limit?: number): Promise<Treatment[]> {
  try {
    const treatments = await getTreatments();
    const today = new Date().toISOString().split('T')[0];
    const upcoming = treatments
      .filter((t) => t.date >= today && t.status === 'scheduled')
      .sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
    return limit ? upcoming.slice(0, limit) : upcoming;
  } catch (error) {
    console.error('Failed to get upcoming treatments:', error);
    return [];
  }
}

export async function getPastTreatments(limit?: number): Promise<Treatment[]> {
  try {
    const treatments = await getTreatments();
    const today = new Date().toISOString().split('T')[0];
    const past = treatments
      .filter((t) => t.date < today || t.status === 'completed')
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return (b.startTime || '').localeCompare(a.startTime || '');
      });
    return limit ? past.slice(0, limit) : past;
  } catch (error) {
    console.error('Failed to get past treatments:', error);
    return [];
  }
}
