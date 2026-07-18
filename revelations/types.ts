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

// How this word came to me: a one-time nudge, an ongoing practice, or an
// identity/destiny declaration over me.
export type RevelationType = '一次性行動' | '持續性操練' | '身分宣告';

export interface Revelation {
  id: string;
  text: string;
  category: Category;
  status: Status;
  type: RevelationType;
  firstDate: string; // YYYY-MM-DD, when first received
  lastDate: string; // YYYY-MM-DD, most recent time it was reconfirmed
  recurCount: number; // how many times this word has recurred
  createdAt: number;
  updatedAt: number;
}

export type RevelationDraft = Pick<Revelation, 'text' | 'category' | 'status' | 'type'>;
