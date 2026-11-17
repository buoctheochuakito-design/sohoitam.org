import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, Music, Search } from 'lucide-react';
import type { LiturgicalDay } from '../types/catholic';
import { COLOR_META, formatDateKey, parseDateKey } from '../data/liturgy';
import {
  HANOI_SACRED_HYMNS,
  HANOI_SACRED_MUSIC_URL,
  getSuggestedSeasonGroupForLiturgy,
  type SacredHymnSuggestion,
} from '../data/hanoiSacredMusic';

interface LiturgyMusicPageProps {
  liturgy: LiturgicalDay;
  todayDateKey: string;
  onChangeDate: (dateKey: string) => void;
  onOpenWordOfGod: () => void;
}

type SeasonFilter = 'all' | SacredHymnSuggestion['seasonGroup'];

const SEASON_TABS: { id: SeasonFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả mùa lễ' },
  { id: 'Mùa Thường Niên', label: 'Mùa Thường Niên' },
  { id: 'Mùa Vọng', label: 'Mùa Vọng' },
  { id: 'Mùa Giáng Sinh', label: 'Giáng Sinh' },
  { id: 'Mùa Chay', label: 'Mùa Chay' },
  { id: 'Mùa Phục Sinh', label: 'Phục Sinh' },
  { id: 'Đức Mẹ & Tử Đạo', label: 'Đức Mẹ & Tử Đạo' },
  { id: 'Lễ Cầu Hồn', label: 'Lễ Cầu Hồn' },
];

export default function LiturgyMusicPage({
  liturgy,
  todayDateKey,
  onChangeDate,
  onOpenWordOfGod,
}: LiturgyMusicPageProps) {
  const suggestedGroup = getSuggestedSeasonGroupForLiturgy(
    liturgy.season,
    liturgy.color,
    liturgy.feastTitle
  );
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>(suggestedGroup);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSeasonFilter(suggestedGroup);
  }, [suggestedGroup]);

  const colorMeta = COLOR_META[liturgy.color];

  const shiftDay = (delta: number) => {
    const d = parseDateKey(liturgy.dateKey);
    d.setDate(d.getDate() + delta);
    onChangeDate(formatDateKey(d));
  };

  const todayHanoiPicks = useMemo(() => {
    const groupHymns = HANOI_SACRED_HYMNS.filter((h) => h.seasonGroup === suggestedGroup);
    return groupHymns.length > 0 ? groupHymns : HANOI_SACRED_HYMNS.slice(0, 4);
  }, [suggestedGroup]);

  const filteredCatalog = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return HANOI_SACRED_HYMNS.filter((h) => {
      const matchesSeason = seasonFilter === 'all' || h.seasonGroup === seasonFilter;
      const matchesQuery =
        !q ||
        h.title.toLowerCase().includes(q) ||
        h.composer.toLowerCase().includes(q) ||
        h.part.toLowerCase().includes(q) ||
        h.lyricsExcerpt.toLowerCase().includes(q);
      return matchesSeason && matchesQuery;
    });
  }, [seasonFilter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="border-b border-stone-200 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]">
              Phụng Vụ &amp; Thánh Nhạc
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{liturgy.solarDateLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
              <span
                className="w-2.5 h-2.5 rounded-xs border shrink-0"
                style={{ backgroundColor: colorMeta.hex, borderColor: colorMeta.borderHex }}
                aria-hidden="true"
              />
              Áo lễ {liturgy.colorNameVi}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 leading-tight text-balance">
            Phụng Vụ &amp; Bài Hát Gợi Ý — Ủy Ban Thánh Nhạc TGP Hà Nội
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Tổng hợp gợi ý bài hát Thánh lễ cho từng phần phụng vụ và các mùa lễ trong năm theo định hướng của Ủy ban Thánh nhạc Tổng Giáo phận Hà Nội.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => shiftDay(-1)}
            className="w-9 h-9 inline-flex items-center justify-center bg-white border border-stone-300 rounded-lg text-stone-700 hover:border-[var(--liturgy-primary)] hover:text-[var(--liturgy-primary)] cursor-pointer"
            aria-label="Ngày trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChangeDate(todayDateKey)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              liturgy.dateKey === todayDateKey
                ? 'bg-[var(--liturgy-primary)] text-white'
                : 'bg-white border border-stone-300 text-stone-700 hover:text-[var(--liturgy-primary)]'
            }`}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => shiftDay(1)}
            className="w-9 h-9 inline-flex items-center justify-center bg-white border border-stone-300 rounded-lg text-stone-700 hover:border-[var(--liturgy-primary)] hover:text-[var(--liturgy-primary)] cursor-pointer"
            aria-label="Ngày sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <input
            type="date"
            aria-label="Chọn ngày xem gợi ý Phụng vụ"
            value={liturgy.dateKey}
            onChange={(e) => {
              if (e.target.value) onChangeDate(e.target.value);
            }}
            className="px-3 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--liturgy-primary)]"
          />
          <button
            type="button"
            onClick={onOpenWordOfGod}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[var(--liturgy-primary)] text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Đọc Lời Chúa ngày này
          </button>
        </div>
      </div>

      {/* Section 1: Gợi ý cho ngày phụng vụ đang chọn */}
      <section className="space-y-5">
        <div
          className="rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ background: 'var(--liturgy-gradient)' }}
        >
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-white/85 font-semibold">
              Gợi ý hát lễ theo ngày · {liturgy.season} · Áo lễ {liturgy.colorNameVi}
            </p>
            <h2 className="font-serif text-2xl font-bold text-white">
              {liturgy.feastTitle} ({suggestedGroup})
            </h2>
          </div>
          <a
            href={HANOI_SACRED_MUSIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/95 text-stone-900 hover:bg-white rounded-lg whitespace-nowrap shrink-0 transition-colors"
          >
            <Music className="w-3.5 h-3.5 text-[var(--liturgy-primary)]" />
            Trang Ủy ban Thánh nhạc TGP Hà Nội
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {todayHanoiPicks.slice(0, 4).map((hymn) => (
            <article
              key={hymn.id}
              className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between space-y-3"
              style={{ borderTopWidth: '3px', borderTopColor: 'var(--liturgy-primary)' }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-[var(--liturgy-primary)]">
                    {hymn.part}
                  </span>
                  <span className="text-stone-500 truncate">{hymn.composer}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                  {hymn.title}
                </h3>
                <p className="font-serif italic text-xs sm:text-sm text-stone-600 leading-relaxed">
                  “{hymn.lyricsExcerpt}”
                </p>
              </div>
              <p className="text-xs text-stone-500 pt-3 border-t border-stone-200">
                {hymn.usageNote}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: Kho Thánh Ca theo Mùa & Các Lễ Trọng của Ủy ban Thánh nhạc TGP Hà Nội */}
      <section className="space-y-6 pt-4 border-t border-stone-200">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-[var(--liturgy-primary)] font-semibold">
              Danh Mục Bài Hát Phụng Vụ
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
              Tuyển Tập Gợi Ý Theo Mùa Lễ — TGP Hà Nội
            </h2>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên bài hát, nhạc sĩ..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-stone-300 rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--liturgy-primary)]"
            />
          </div>
        </div>

        {/* Season Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-stone-200 rounded-xl w-fit">
          {SEASON_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSeasonFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                seasonFilter === tab.id
                  ? 'bg-[var(--liturgy-primary)] text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Multi-column catalog grid */}
        {filteredCatalog.length === 0 ? (
          <div className="py-12 text-center bg-white border border-stone-200 rounded-xl text-sm text-stone-500">
            Không tìm thấy bài hát phù hợp với từ khóa “{searchTerm}”.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((item) => {
              const cMeta = COLOR_META[item.liturgicalColor];
              return (
                <article
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs border-b border-stone-100 pb-2">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-stone-800">
                        <span
                          className="w-2.5 h-2.5 rounded-xs border shrink-0"
                          style={{ backgroundColor: cMeta.hex, borderColor: cMeta.borderHex }}
                          aria-hidden="true"
                        />
                        {item.seasonGroup}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--liturgy-primary)] font-semibold">
                        {item.part}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs font-medium text-stone-500">
                      Nhạc sĩ: {item.composer}
                    </p>

                    <p className="font-serif italic text-xs sm:text-sm text-stone-600 leading-relaxed">
                      “{item.lyricsExcerpt}”
                    </p>
                  </div>

                  <p className="text-xs text-stone-500 pt-2.5 border-t border-stone-100 leading-relaxed">
                    {item.usageNote}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
