import { UserConfig, UserID } from './types';

// Configuration
// 將年份從 2026 改為 2025
export const START_DATE = new Date('2025-12-01T00:00:00');
export const CHALLENGE_DAYS = 21;

// User Mapping
export const USERS: Record<string, UserConfig> = {
  'user': { id: 'xiaolu', name: '小路', color: 'text-sky-400' }, // Default map 'user' -> xiaolu
  'xiaolu': { id: 'xiaolu', name: '小路', color: 'text-sky-400' },
  'jingfang': { id: 'jingfang', name: '靜芳', color: 'text-rose-400' },
  'jingyi': { id: 'jingyi', name: '靜怡', color: 'text-amber-400' },
};

export const ORDERED_USER_IDS: UserID[] = ['xiaolu', 'jingfang', 'jingyi'];

// Encouragement Messages
export const INDIVIDUAL_QUOTES = [
  "妳的禱告正在撼動天際！",
  "堅持下去，神正在動工！",
  "今天的妳，比昨天更剛強。",
  "禁食是靈裡的飛翔，加油！",
  "主看見妳的擺上，必親自報答。",
  "妳是蒙愛的，妳是寶貴的。",
  "在安靜中重新得力。",
];

// Group Completion Verses
export const GROUP_VERSES = [
  { text: "靠著愛我們的主，在這一切的事上已經得勝有餘了。", ref: "羅馬書 8:37" },
  { text: "三股合成的繩子不容易折斷。", ref: "傳道書 4:12" },
  { text: "你們祈求，就給你們；尋找，就尋見；叩門，就給你們開門。", ref: "馬太福音 7:7" },
  { text: "那等候耶和華的必從新得力。", ref: "以賽亞書 40:31" },
  { text: "你們若有信心像一粒芥菜種，就是對這座山說：『你從這邊挪到那邊』，它也必挪去。", ref: "馬太福音 17:20" },
];