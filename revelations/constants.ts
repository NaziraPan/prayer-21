import { Category, Status } from './types';

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

// Oil lamp visual stage per status: 1=未點燈 2=半亮 3=全亮 4=穩定發光
export const STATUS_LAMP_STAGE: Record<Status, 1 | 2 | 3 | 4> = {
  '尚未開始': 1,
  '進行中': 2,
  '已建立習慣': 3,
  '已成就': 4,
};

export const STATUS_BADGE_CLASS: Record<Status, string> = {
  '尚未開始': 'bg-slate-100 text-slate-500 border-slate-200',
  '進行中': 'bg-amber-100 text-amber-700 border-amber-200',
  '已建立習慣': 'bg-violet-100 text-violet-700 border-violet-200',
  '已成就': 'bg-[#16244F] text-[#FFE29A] border-[#16244F]',
};

export const CATEGORY_BADGE_CLASS: Record<Category, string> = {
  身分宣告: 'bg-violet-50 text-violet-700 border-violet-200',
  健康紀律: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  學業: 'bg-sky-50 text-sky-700 border-sky-200',
  宣教: 'bg-orange-50 text-orange-700 border-orange-200',
  禱告操練: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  同工合一: 'bg-teal-50 text-teal-700 border-teal-200',
  建造異象: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  鑑察警醒: 'bg-rose-50 text-rose-700 border-rose-200',
  詩歌創作: 'bg-pink-50 text-pink-700 border-pink-200',
  讀經筆記: 'bg-amber-50 text-amber-700 border-amber-200',
};
