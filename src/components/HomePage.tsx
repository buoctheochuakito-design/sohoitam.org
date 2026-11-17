import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  Heart,
  Lock,
  Music,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { DailyLivingEntry, LiturgicalDay, NewsArticle, PageId } from '../types/catholic';
import { COLOR_META, getLiturgicalTheme } from '../data/liturgy';
import { MONTHLY_PAPAL_INTENTIONS, getDailyPrayerFocus } from '../data/prayerIntentions';
import { hasPinConfigured } from '../utils/journalStorage';
import { NEWS_GROUP_META } from '../utils/newsCategories';

interface HomePageProps {
  todayLiturgy: LiturgicalDay;
  todayEntry: DailyLivingEntry;
  latestNews: NewsArticle[];
  onUpdateTodayEntry: (updated: DailyLivingEntry) => void;
  onNavigate: (page: PageId, scrollToExamen?: boolean) => void;
  onSelectDateAndGo?: (dateKey: string, page: PageId) => void;
}

export default function HomePage({
  todayLiturgy,
  todayEntry,
  latestNews,
  onUpdateTodayEntry,
  onNavigate,
  onSelectDateAndGo,
}: HomePageProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const colorMeta = COLOR_META[todayLiturgy.color];
  const themePalette = getLiturgicalTheme(todayLiturgy.color);
  const monthNum = Number(todayLiturgy.dateKey.split('-')[1]);
  const monthlyIntention =
    MONTHLY_PAPAL_INTENTIONS.find((item) => item.month === monthNum) ||
    MONTHLY_PAPAL_INTENTIONS[10];
  const dailyPrayerFocus = getDailyPrayerFocus(
    todayLiturgy.dateKey,
    todayLiturgy.feastTitle,
    todayLiturgy.season
  );

  // Featured Lead Story + Latest Headlines List (giaophanbacninh.com pattern)
  const leadStory: NewsArticle | null =
    latestNews.find((n) => n.newsGroup === 'vatican') || latestNews[0] || null;
  const latestHeadlines = latestNews
    .filter((item) => !leadStory || item.id !== leadStory.id)
    .slice(0, 6);

  // 3-Column News Sections
  const vaticanColumnNews = latestNews.filter((n) => n.newsGroup === 'vatican').slice(0, 4);
  const vietnamColumnNews = latestNews.filter((n) => n.newsGroup === 'vietnam').slice(0, 4);
  const worldColumnNews = latestNews.filter((n) => n.newsGroup === 'world').slice(0, 4);

  const pinEnabled = hasPinConfigured();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-10">
      {/* 0. Dải Sắc Phụng Vụ Hôm Nay (Dynamic Liturgical Vestment Gradient Bar) */}
      <section
        className="rounded-xl px-5 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        style={{ background: themePalette.gradient }}
      >
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
          <span
            className="w-3 h-3 rounded-xs border border-white/80 shrink-0"
            style={{ backgroundColor: colorMeta.hex }}
            aria-hidden="true"
          />
          <span className="font-semibold">
            {todayLiturgy.weekdayLabel}, {todayLiturgy.solarDateLabel}
          </span>
          <span aria-hidden="true" className="text-white/70">·</span>
          <span className="font-serif font-medium text-white">
            {todayLiturgy.feastTitle}
          </span>
          <span aria-hidden="true" className="text-white/70 hidden sm:inline">·</span>
          <span className="text-white/90 text-xs">
            {themePalette.labelVi}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('liturgy')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/18 hover:bg-white/28 text-white rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors"
          >
            <Music className="w-3.5 h-3.5" />
            Phụng vụ &amp; Thánh nhạc TGP Hà Nội
          </button>
        </div>
      </section>

      {/* 1. TIN NỔI BẬT & DANH SÁCH TIÊU ĐỀ XEM THÊM (Lead Story + Latest Headlines Split) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 cols: Lead Story */}
        <article className="lg:col-span-7 bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="relative min-h-[260px] sm:min-h-[340px] bg-stone-200">
            <img
              src={leadStory?.imageUrl || '/src/assets/images/hero_papal_vatican_event_1794841533436.jpg'}
              alt={leadStory?.title || 'Quảng trường Thánh Phêrô tại Vatican'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = '/src/assets/images/hero_papal_vatican_event_1794841533436.jpg';
              }}
              className="w-full h-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
            />
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-xs border border-white/60 shrink-0"
                  style={{ backgroundColor: colorMeta.hex }}
                  aria-hidden="true"
                />
                <span className="font-medium truncate">
                  {todayLiturgy.weekdayLabel}, {todayLiturgy.solarDateLabel} · {todayLiturgy.feastTitle}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('word')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-white rounded font-medium whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'var(--liturgy-gradient)' }}
              >
                <BookOpen className="w-3 h-3" />
                Lời Chúa hôm nay
              </button>
            </div>
          </div>

          <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                <span className="font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]">
                  Tin nổi bật · {leadStory ? NEWS_GROUP_META[leadStory.newsGroup].label : 'Vatican'}
                </span>
                <span className="font-mono tabular-nums">
                  {leadStory ? new Date(leadStory.publishedAt).toLocaleDateString('vi-VN') : todayLiturgy.solarDateLabel}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug text-balance">
                <button
                  type="button"
                  onClick={() => leadStory && setSelectedArticle(leadStory)}
                  className="text-left hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
                >
                  {leadStory
                    ? leadStory.title
                    : 'Hiệp Thông Cùng Giáo Hội Hoàn Vũ Trong Đời Sống Phụng Vụ'}
                </button>
              </h1>

              <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">
                {leadStory
                  ? leadStory.summary
                  : 'Cập nhật những sự kiện trọng đại của Tòa Thánh, Giáo Hội Việt Nam và đời sống đức tin thế giới mỗi ngày.'}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-500">{leadStory?.sourceLabel || 'Vaticano Tiếng Việt'}</span>
              <button
                type="button"
                onClick={() => (leadStory ? setSelectedArticle(leadStory) : onNavigate('news'))}
                className="inline-flex items-center gap-1 font-semibold text-[var(--liturgy-primary)] hover:underline cursor-pointer"
              >
                Xem thêm
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </article>

        {/* Right 5 cols: Latest Headlines List ("Tin mới · Tiêu đề xem thêm") */}
        <aside
          className="lg:col-span-5 bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col"
          style={{ borderTopWidth: '3px', borderTopColor: 'var(--liturgy-primary)' }}
        >
          <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-stone-200 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[var(--liturgy-primary)]">
              Tin Mới Nhất
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[var(--liturgy-primary)] cursor-pointer"
            >
              Xem thêm
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-200 flex-1">
            {latestHeadlines.map((article) => {
              const meta = NEWS_GROUP_META[article.newsGroup];
              return (
                <div
                  key={article.id}
                  className="px-5 py-3.5 hover:bg-[#FAF8F4]/80 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
                    <span className="font-semibold uppercase tracking-wide" style={{ color: meta.dotColor }}>
                      {meta.label} · {article.category}
                    </span>
                    <span className="font-mono tabular-nums shrink-0">
                      {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <h3 className="font-serif text-sm sm:text-[15px] font-semibold text-stone-900 leading-snug">
                    <button
                      type="button"
                      onClick={() => setSelectedArticle(article)}
                      className="text-left hover:text-[#8B261D] transition-colors cursor-pointer line-clamp-2"
                    >
                      {article.title}
                    </button>
                  </h3>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 bg-[#FAF8F4] border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">Nguồn: Vaticano Tiếng Việt · HĐGMVN</span>
            <button
              type="button"
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-1 font-semibold text-[#8B261D] hover:underline cursor-pointer"
            >
              Xem tất cả tin tức
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </section>

      {/* 2. CÁC CHUYÊN MỤC TIN TỨC GIÁO HỘI (3 Columns with Lead + Clickable Headlines + Xem thêm) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { group: 'vatican' as const, title: 'Tin Vatican', items: vaticanColumnNews, accent: '#8B261D' },
          { group: 'vietnam' as const, title: 'Giáo Hội Việt Nam', items: vietnamColumnNews, accent: '#1B365D' },
          { group: 'world' as const, title: 'Giáo Hội Thế Giới', items: worldColumnNews, accent: '#1F5E3B' },
        ].map((col) => {
          const [lead, ...rest] = col.items;
          return (
            <div
              key={col.group}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between"
              style={{ borderTopWidth: '3px', borderTopColor: col.accent }}
            >
              <div>
                <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-stone-200 flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold" style={{ color: col.accent }}>
                    {col.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => onNavigate('news')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[#8B261D] cursor-pointer"
                  >
                    Xem thêm
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {lead && (
                  <div className="p-5 border-b border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-semibold uppercase tracking-wide" style={{ color: col.accent }}>
                        {lead.category}
                      </span>
                      <span className="font-mono tabular-nums">
                        {new Date(lead.publishedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(lead)}
                        className="text-left hover:text-[#8B261D] transition-colors cursor-pointer"
                      >
                        {lead.title}
                      </button>
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-2">
                      {lead.summary}
                    </p>
                  </div>
                )}

                <div className="divide-y divide-stone-200">
                  {rest.map((item) => (
                    <div key={item.id} className="px-5 py-3.5 hover:bg-[#FAF8F4]/70 transition-colors space-y-1">
                      <h4 className="font-serif text-sm font-semibold text-stone-900 leading-snug">
                        <button
                          type="button"
                          onClick={() => setSelectedArticle(item)}
                          className="text-left hover:text-[#8B261D] transition-colors cursor-pointer"
                        >
                          {item.title}
                        </button>
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span className="truncate pr-2">{item.sourceLabel}</span>
                        <span className="font-mono tabular-nums shrink-0">
                          {new Date(item.publishedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 bg-[#FAF8F4] border-t border-stone-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate('news')}
                  className="inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer"
                  style={{ color: col.accent }}
                >
                  Xem thêm tin {col.title}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. PHỤNG VỤ & ĐỜI SỐNG ĐỨC TIN HÔM NAY (3 Columns with Headlines & Xem thêm) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Lời Chúa & Phụng vụ Thánh nhạc TGP Hà Nội */}
        <div
          className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between"
          style={{ borderTopWidth: '3px', borderTopColor: 'var(--liturgy-primary)' }}
        >
          <div>
            <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[var(--liturgy-primary)]">
                Lời Chúa &amp; Phụng Vụ
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('word')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[var(--liturgy-primary)] cursor-pointer"
              >
                Xem thêm
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-5 border-b border-stone-200 space-y-2">
              <p className="text-[11px] font-mono font-semibold text-[var(--liturgy-primary)]">
                Tin Mừng · {todayLiturgy.gospel.citation}
              </p>
              <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                <button
                  type="button"
                  onClick={() => onNavigate('word')}
                  className="text-left hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
                >
                  {todayLiturgy.gospel.title}
                </button>
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                {todayLiturgy.gospel.verses[0]}
              </p>
            </div>

            <div className="divide-y divide-stone-200 text-sm">
              <button
                type="button"
                onClick={() => onNavigate('word')}
                className="w-full text-left px-5 py-3 hover:bg-[#FAF8F4] transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="font-serif font-medium text-stone-900 truncate">
                  Bài đọc 1: {todayLiturgy.reading1.title}
                </span>
                <span className="font-mono text-xs text-stone-500 shrink-0">
                  {todayLiturgy.reading1.citation}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('word')}
                className="w-full text-left px-5 py-3 hover:bg-[#FAF8F4] transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="font-serif font-medium text-stone-900 truncate">
                  Đáp ca: {todayLiturgy.psalm.refrain}
                </span>
                <span className="font-mono text-xs text-stone-500 shrink-0">
                  {todayLiturgy.psalm.citation.split('(')[0].trim()}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('liturgy')}
                className="w-full text-left px-5 py-3 hover:bg-[#FAF8F4] transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="font-serif font-medium text-stone-900 truncate">
                  Thánh nhạc TGP Hà Nội: {todayLiturgy.hymns[0]?.title}
                </span>
                <span className="text-xs font-semibold text-[var(--liturgy-primary)] shrink-0">
                  Phụng vụ →
                </span>
              </button>
            </div>
          </div>

          <div className="px-5 py-3 bg-[#FAF8F4] border-t border-stone-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onNavigate('liturgy')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-[var(--liturgy-primary)] cursor-pointer"
            >
              Gợi ý hát lễ TGP Hà Nội
            </button>
            <button
              type="button"
              onClick={() => onNavigate('word')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--liturgy-primary)] hover:underline cursor-pointer"
            >
              Đọc Lời Chúa
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 2: Lịch Công Giáo */}
        <div className="bg-white border border-stone-200 border-t-[3px] border-t-[#1B365D] rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#1B365D]">
                Lịch Công Giáo
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[#8B261D] cursor-pointer"
              >
                Xem thêm
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-5 border-b border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-mono tabular-nums">
                  {todayLiturgy.weekdayLabel}, {todayLiturgy.solarDateLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                  <span
                    className="w-2.5 h-2.5 rounded-xs border shrink-0"
                    style={{ backgroundColor: colorMeta.hex, borderColor: colorMeta.borderHex }}
                    aria-hidden="true"
                  />
                  Áo lễ {todayLiturgy.colorNameVi}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                {todayLiturgy.feastTitle}
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-2">
                {todayLiturgy.seasonDetail} · Bậc lễ: {todayLiturgy.rank}. {todayLiturgy.saints.map((s) => s.name).join(' · ')}
              </p>
            </div>

            <div className="divide-y divide-stone-200 text-sm">
              {[
                { key: '2026-11-22', label: 'Đại lễ Chúa Giêsu Kitô Vua Vũ Trụ', date: '22/11/2026' },
                { key: '2026-11-24', label: 'Các Thánh Tử Đạo Việt Nam', date: '24/11/2026' },
                { key: '2026-11-29', label: 'Chúa Nhật I Mùa Vọng', date: '29/11/2026' },
              ].map((feast) => (
                <button
                  key={feast.key}
                  type="button"
                  onClick={() =>
                    onSelectDateAndGo
                      ? onSelectDateAndGo(feast.key, 'calendar')
                      : onNavigate('calendar')
                  }
                  className="w-full text-left px-5 py-3 hover:bg-[#FAF8F4] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="font-serif font-medium text-stone-900 truncate">
                    {feast.label}
                  </span>
                  <span className="font-mono text-xs text-stone-500 shrink-0 tabular-nums">
                    {feast.date}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-3 bg-[#FAF8F4] border-t border-stone-200 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigate('calendar')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B365D] hover:underline cursor-pointer"
            >
              Tra cứu lịch phụng vụ tháng
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 3: Ngày sống & Hồi tâm */}
        <div className="bg-white border border-stone-200 border-t-[3px] border-t-[#1F5E3B] rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#1F5E3B]">
                Ngày Sống &amp; Hồi Tâm
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('daily')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[#8B261D] cursor-pointer"
              >
                Xem thêm
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-5 border-b border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span className="font-semibold uppercase tracking-wide text-[#1F5E3B]">
                  Ý chỉ Đức Thánh Cha · {monthlyIntention.monthNameVi}
                </span>
                <Heart className="w-3.5 h-3.5 text-[#8B261D]" />
              </div>

              <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">
                {monthlyIntention.title}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                {dailyPrayerFocus}
              </p>

              <button
                type="button"
                onClick={() =>
                  onUpdateTodayEntry({
                    ...todayEntry,
                    morningOfferingDone: !todayEntry.morningOfferingDone,
                  })
                }
                className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  todayEntry.morningOfferingDone
                    ? 'bg-[#1F5E3B] text-white'
                    : 'bg-[#FAF8F4] border border-stone-300 text-stone-800 hover:border-[#8B261D]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {todayEntry.morningOfferingDone ? 'Đã dâng ngày hôm nay' : 'Dâng ngày hiệp thông'}
              </button>
            </div>

            <div className="divide-y divide-stone-200 text-xs">
              <div className="px-5 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-stone-500">Quyết tâm ({todayEntry.resolutionCategory})</p>
                  <p className="font-medium text-stone-800 truncate">
                    {todayEntry.resolutionText || 'Chưa ghi hành động hôm nay'}
                  </p>
                </div>
                {todayEntry.resolutionText && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateTodayEntry({
                        ...todayEntry,
                        resolutionCompleted: !todayEntry.resolutionCompleted,
                      })
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-medium shrink-0 cursor-pointer ${
                      todayEntry.resolutionCompleted
                        ? 'bg-[#1F5E3B] text-white'
                        : 'bg-[#FAF8F4] border border-stone-300 text-stone-700'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    {todayEntry.resolutionCompleted ? 'Xong' : 'Đánh dấu'}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('daily', true)}
                className="w-full text-left px-5 py-3 hover:bg-[#FAF8F4] transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="font-medium text-stone-900">
                  Nhật ký Hồi tâm riêng tư ({todayLiturgy.examenQuestions.length} câu hỏi Tin Mừng)
                </span>
                {pinEnabled ? (
                  <Lock className="w-3.5 h-3.5 text-[#8B261D] shrink-0" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                )}
              </button>
            </div>
          </div>

          <div className="px-5 py-3 bg-[#FAF8F4] border-t border-stone-200 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigate('daily', true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F5E3B] hover:underline cursor-pointer"
            >
              Mở Ngày sống &amp; Viết Hồi tâm
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. VỀ CHÚNG TÔI (Compact 4-Column Directory) */}
      <section className="border-t border-stone-300/80 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-stone-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
          <div className="p-5 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]">
              01 · Tin tức Giáo Hội
            </p>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Vatican &amp; Việt Nam
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tổng hợp tin mới từ Vaticano Tiếng Việt, Vatican News và Hội đồng Giám mục Việt Nam.
            </p>
          </div>
          <div className="p-5 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1B365D]">
              02 · Lịch &amp; Màu Áo Lễ
            </p>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Giao diện đổi theo ngày
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Màu sắc trang web thay đổi tự động theo áo lễ từng ngày: Thường Niên xanh-vàng, Vọng/Chay tím, Tử Đạo đỏ, Lễ Kính vàng.
            </p>
          </div>
          <div className="p-5 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]">
              03 · Phụng vụ &amp; Thánh nhạc
            </p>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Ủy ban Thánh nhạc TGP Hà Nội
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Bài đọc Lời Chúa hằng ngày và tuyển tập bài hát Thánh lễ gợi ý theo mùa từ Ủy ban Thánh nhạc TGP Hà Nội.
            </p>
          </div>
          <div className="p-5 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1F5E3B]">
              04 · Suy niệm &amp; Hồi tâm
            </p>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Mã hóa riêng từng Gmail
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Suy niệm Tin Mừng và nhật ký hồi tâm cá nhân được mã hóa AES-256-GCM tách biệt theo tài khoản Gmail của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-news-modal-title"
        >
          <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-[#8B261D]">
                  {NEWS_GROUP_META[selectedArticle.newsGroup].label}
                </span>
                <span aria-hidden="true">·</span>
                <span>{selectedArticle.sourceLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono">
                  {new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-stone-900 cursor-pointer shrink-0"
                aria-label="Đóng bài viết"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2
              id="home-news-modal-title"
              className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 leading-snug"
            >
              {selectedArticle.title}
            </h2>

            <p className="text-base text-stone-700 leading-relaxed">
              {selectedArticle.summary}
            </p>

            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <a
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#FBF9F5] bg-[#8B261D] hover:bg-[#6E1D15] rounded-lg transition-colors"
              >
                Đọc toàn văn tại {selectedArticle.sourceLabel}
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
