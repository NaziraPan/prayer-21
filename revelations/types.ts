export type Category =
  | '身分宣告'
  | '健康紀律'
  | '學業'
  | '宣教'
  | '禱告操練'
  | '同工合一'
  | '建造異象'
  | '鑑察警醒'
  | '詩歌創作'
  | '讀經筆記';

export type Status = '尚未開始' | '進行中' | '已建立習慣' | '已成就';

export interface Revelation {
  id: string;
  text: string;
  category: Category;
  status: Status;
  createdAt: number;
  updatedAt: number;
}

export type RevelationDraft = Pick<Revelation, 'text' | 'category' | 'status'>;
