export type UserID = 'xiaolu' | 'jingfang' | 'jingyi';

export interface UserConfig {
  id: UserID;
  name: string;
  color: string; // Tailwind color class for the sparkle
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  xiaolu: boolean;
  jingfang: boolean;
  jingyi: boolean;
}

export interface ProgressData {
  [date: string]: DailyRecord;
}
