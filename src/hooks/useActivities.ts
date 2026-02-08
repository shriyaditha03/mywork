import { useState, useEffect, useCallback } from 'react';

export interface ActivityRecord {
  id: string;
  date: string;
  time: string;
  ampm: 'AM' | 'PM';
  tank: string;
  activity: string;
  comments: string;
  data: Record<string, any>;
  createdAt: string;
}

const STORAGE_KEY = 'aqua-nexus-activities';

function loadActivities(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActivities(activities: ActivityRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

export function useActivities() {
  const [activities, setActivities] = useState<ActivityRecord[]>(loadActivities);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  const addActivity = useCallback((record: Omit<ActivityRecord, 'id' | 'createdAt'>) => {
    const newRecord: ActivityRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setActivities(prev => [newRecord, ...prev]);
    return newRecord.id;
  }, []);

  const updateActivity = useCallback((id: string, record: Partial<ActivityRecord>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...record } : a));
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  const getActivity = useCallback((id: string) => {
    return activities.find(a => a.id === id);
  }, [activities]);

  return { activities, addActivity, updateActivity, deleteActivity, getActivity };
}
