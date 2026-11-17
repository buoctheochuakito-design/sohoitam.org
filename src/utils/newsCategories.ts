import type { NewsArticle } from '../types/catholic';

export const NEWS_GROUP_META: Record<
  NewsArticle['newsGroup'],
  { label: string; dotColor: string; bgClass: string; textClass: string; borderClass: string }
> = {
  vatican: {
    label: 'Vatican',
    dotColor: '#8B261D',
    bgClass: 'bg-[#8B261D]/10',
    textClass: 'text-[#8B261D]',
    borderClass: 'border-[#8B261D]/25',
  },
  vietnam: {
    label: 'Giáo Hội Việt Nam',
    dotColor: '#1B365D',
    bgClass: 'bg-[#1B365D]/10',
    textClass: 'text-[#1B365D]',
    borderClass: 'border-[#1B365D]/25',
  },
  world: {
    label: 'Thế giới',
    dotColor: '#1F5E3B',
    bgClass: 'bg-[#1F5E3B]/10',
    textClass: 'text-[#1F5E3B]',
    borderClass: 'border-[#1F5E3B]/25',
  },
};
