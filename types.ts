export enum Gender {
  BOY = 'Boy',
  GIRL = 'Girl'
}

export interface ChildProfile {
  name: string;
  birthDate: string; // ISO Date string
  gender: Gender;
}

export interface GrowthRecord {
  id: string;
  date: string; // ISO Date string
  height: number; // cm
  weight: number; // kg
  notes?: string;
}

export interface VaccineRecord {
  id: string;
  date: string;
  vaccineName: string;
  dose: string;
  location: string;
  photo?: string; // Base64 string
}

export interface AppState {
  profile: ChildProfile | null;
  records: GrowthRecord[];
  vaccines: VaccineRecord[];
}
