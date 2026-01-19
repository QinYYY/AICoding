import { AppState, ChildProfile, GrowthRecord } from '../types';

const STORAGE_KEY = 'littlesprout_data_v1';

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return { profile: null, records: [], vaccines: [] };
    }
    const state = JSON.parse(serializedState);
    // Ensure vaccines array exists for backward compatibility
    if (!state.vaccines) {
      state.vaccines = [];
    }
    return state;
  } catch (err) {
    console.error("Could not load state", err);
    return { profile: null, records: [], vaccines: [] };
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Could not save state", err);
  }
};

export const clearState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
