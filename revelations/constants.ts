import { Category, RevelationType, Status } from './types';

export const CATEGORIES: Category[] = [
  '身分宣告',
  '健康紀律',
  '學業',
  '宣教',
  '禱告操練',
  '同工合一',
  '建造異象',
  '鑑察警醒',
  '詩歌創作',
  '讀經筆記',
];

export const STATUSES: Status[] = ['尚未開始', '進行中', '已建立習慣', '已成就'];

// English keys purely for the status-btn[data-s] CSS selectors.
export const STATUS_KEY: Record<Status, string> = {
  尚未開始: 'not_started',
  進行中: 'in_progress',
  已建立習慣: 'habit',
  已成就: 'fulfilled',
};

export const TYPES: RevelationType[] = ['一次性行動', '持續性操練', '身分宣告'];

// Repeated words are worth surfacing: 3+ recurrences not yet habit/fulfilled.
export const RECUR_CALLOUT_THRESHOLD = 3;
