export type PageId = 'home' | 'calendar' | 'news' | 'liturgy' | 'word' | 'daily';

export type LiturgicalColor = 'green' | 'white' | 'red' | 'purple' | 'rose';

export type LiturgicalSeason =
  | 'Mùa Vọng'
  | 'Mùa Giáng Sinh'
  | 'Mùa Chay'
  | 'Tam Nhật Thánh'
  | 'Mùa Phục Sinh'
  | 'Mùa Thường Niên';

export type FeastRank =
  | 'Lễ Trọng'
  | 'Lễ Kính'
  | 'Lễ Nhớ'
  | 'Lễ Nhớ Tự Do'
  | 'Chúa Nhật'
  | 'Ngày Thường';

export interface ScriptureReading {
  label: string;
  citation: string;
  title: string;
  intro: string;
  verses: string[];
  suggestedQuotes: {
    text: string;
    reference: string;
  }[];
}

export interface ResponsorialPsalm {
  citation: string;
  refrain: string;
  stanzas: string[];
}

export interface LiturgicalHymn {
  part: 'Ca nhập lễ' | 'Ca dâng lễ' | 'Ca hiệp lễ' | 'Ca kết lễ';
  title: string;
  composer: string;
  lyricsExcerpt: string;
  liturgicalNote: string;
}

export interface LiturgicalDay {
  dateKey: string; // YYYY-MM-DD
  solarDateLabel: string;
  weekdayLabel: string;
  season: LiturgicalSeason;
  seasonDetail: string;
  color: LiturgicalColor;
  colorNameVi: string;
  colorMeaning: string;
  rank: FeastRank;
  feastTitle: string;
  saints: {
    name: string;
    role: string;
    biography: string;
  }[];
  liturgicalNotes: string[];
  reading1: ScriptureReading;
  psalm: ResponsorialPsalm;
  reading2: ScriptureReading | null;
  gospelAcclamation: string;
  gospel: ScriptureReading;
  hymns: LiturgicalHymn[];
  examenQuestions: string[];
  gospelReflection: {
    theme: string;
    paragraphs: string[];
    prayerPrompt: string;
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  source: 'vietnam' | 'vatican-vi' | 'vatican-en';
  newsGroup: 'vatican' | 'vietnam' | 'world';
  sourceLabel: string;
  category: string;
  imageUrl?: string;
  isLive: boolean;
}

export interface AiGospelExamen {
  theme: string;
  reflectionSummary: string;
  prayerPrompt: string;
  questions: string[];
  generatedAt: string;
}

export interface DailyLivingEntry {
  dateKey: string;
  morningOfferingDone: boolean;
  chosenQuote: {
    text: string;
    sourceLabel: string;
    reference: string;
  } | null;
  resolutionCategory: 'Bố thí & Bác ái' | 'Cầu nguyện' | 'Hãm mình & Nhẫn nại' | 'Thăm viếng & Tha thứ';
  resolutionText: string;
  resolutionCompleted: boolean;
  examenResponses: Record<number, string>;
  gospelReflectionNote?: string;
  aiReflection?: AiGospelExamen;
  journalNote: string;
  updatedAt: string;
}

export interface GmailAccountMeta {
  email: string;
  emailHash: string;
  displayName: string;
  saltBase64: string;
  verifierHash: string;
  createdAt: string;
}

export interface EncryptedVaultPayload {
  ivBase64: string;
  cipherBase64: string;
  updatedAt: string;
}

