import { useState } from 'react';
import { ArrowRight, BookmarkCheck, Calendar, Check, ChevronLeft, ChevronRight, ExternalLink, Music } from 'lucide-react';
import type { DailyLivingEntry, LiturgicalDay } from '../types/catholic';
import { COLOR_META, formatDateKey, parseDateKey } from '../data/liturgy';
import { HANOI_SACRED_MUSIC_URL } from '../data/hanoiSacredMusic';

interface WordOfGodPageProps {
  liturgy: LiturgicalDay;
  entry: DailyLivingEntry;
  todayDateKey: string;
  onChangeDate: (dateKey: string) => void;
  onPickQuote: (quote: { text: string; sourceLabel: string; reference: string }) => void;
  onOpenCalendar: () => void;
  onOpenDailyLiving: () => void;
  onOpenLiturgyMusic?: () => void;
}

export default function WordOfGodPage({
  liturgy,
  entry,
  todayDateKey,
  onChangeDate,
  onPickQuote,
  onOpenCalendar,
  onOpenDailyLiving,
  onOpenLiturgyMusic,
}: WordOfGodPageProps) {
  const [justSavedRef, setJustSavedRef] = useState<string | null>(null);
  const colorMeta = COLOR_META[liturgy.color];

  const shiftDay = (delta: number) => {
    const d = parseDateKey(liturgy.dateKey);
    d.setDate(d.getDate() + delta);
    onChangeDate(formatDateKey(d));
  };

  const handleSaveQuote = (quote: { text: string; sourceLabel: string; reference: string }) => {
    onPickQuote(quote);
    setJustSavedRef(quote.reference);
    setTimeout(() => setJustSavedRef(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header & Date Controls with Liturgical Color Ribbon */}
      <div className="border-b border-stone-300/70 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-500">
            <span className="font-semibold text-stone-900">{liturgy.weekdayLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{liturgy.solarDateLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{liturgy.season}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-white border border-stone-300 text-stone-900">
              <span
                className="w-2.5 h-2.5 rounded-xs border inline-block"
                style={{ backgroundColor: colorMeta.hex, borderColor: colorMeta.borderHex }}
                aria-hidden="true"
              />
              Áo lễ {liturgy.colorNameVi}
            </span>
          </div>

          <div className="flex items-start gap-3.5">
            <span
              className="w-1.5 self-stretch rounded-full shrink-0 mt-1"
              style={{ backgroundColor: colorMeta.hex }}
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 leading-tight text-balance">
                Lời Chúa Trong Thánh Lễ: {liturgy.feastTitle}
              </h1>
              <p className="text-sm text-stone-600">
                {liturgy.seasonDetail} · Bậc lễ: {liturgy.rank}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => shiftDay(-1)}
            className="w-9 h-9 inline-flex items-center justify-center neu-surface-sm rounded-lg text-stone-700 hover:text-[var(--liturgy-primary)] cursor-pointer"
            aria-label="Ngày trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChangeDate(todayDateKey)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              liturgy.dateKey === todayDateKey
                ? 'bg-[var(--liturgy-primary)] text-[#FBF9F5]'
                : 'neu-surface-sm text-stone-700 hover:text-[var(--liturgy-primary)]'
            }`}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => shiftDay(1)}
            className="w-9 h-9 inline-flex items-center justify-center neu-surface-sm rounded-lg text-stone-700 hover:text-[var(--liturgy-primary)] cursor-pointer"
            aria-label="Ngày sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <input
            type="date"
            aria-label="Chọn nhanh ngày đọc Lời Chúa"
            value={liturgy.dateKey}
            onChange={(e) => {
              if (e.target.value) onChangeDate(e.target.value);
            }}
            className="px-3 py-1.5 text-xs font-mono neu-inset rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--liturgy-primary)]"
          />
          <button
            type="button"
            onClick={onOpenCalendar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium neu-surface-sm text-stone-800 rounded-lg hover:text-[var(--liturgy-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            Lịch tháng
          </button>
        </div>
      </div>

      {/* Main Content: Missal / Bible Book Reading Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Sacred Scripture Readings formatted like an open Lectionary */}
        <div className="lg:col-span-7 space-y-10">
          {/* Bài đọc 1 */}
          <article className="bg-[#FCFBF8] border border-stone-200/90 shadow-sm rounded-2xl p-7 sm:p-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[var(--liturgy-primary)] font-semibold">
                  {liturgy.reading1.label}
                </p>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900">
                  {liturgy.reading1.title}
                </h2>
              </div>
              <span className="font-mono text-xs text-[var(--liturgy-primary)] font-medium">
                {liturgy.reading1.citation}
              </span>
            </div>

            <p className="font-serif text-sm italic text-[var(--liturgy-primary)]">{liturgy.reading1.intro}</p>

            <div className="space-y-5 font-serif text-[17.5px] sm:text-[18.5px] text-stone-800 leading-[1.95] max-w-prose">
              {liturgy.reading1.verses.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <p className="text-sm font-serif italic text-[var(--liturgy-primary)] pt-2">
              Đó là Lời Chúa. — Tạ ơn Chúa.
            </p>

            {liturgy.reading1.suggestedQuotes.length > 0 && (
              <div className="pt-5 border-t border-stone-200 space-y-2.5">
                <p className="text-xs text-stone-500">Chọn câu Lời Chúa tâm đắc từ Bài đọc 1 cho Ngày sống:</p>
                <div className={`grid grid-cols-1 ${liturgy.reading1.suggestedQuotes.length > 1 ? 'sm:grid-cols-2' : ''} gap-3`}>
                  {liturgy.reading1.suggestedQuotes.map((sq) => {
                    const isPicked = entry.chosenQuote?.text === sq.text;
                    return (
                      <div
                        key={sq.reference}
                        className="flex flex-col justify-between gap-3 bg-[#FAF8F4] border border-stone-200 rounded-xl p-3.5"
                      >
                        <p className="font-serif italic text-sm text-stone-700">
                          “{sq.text}” <span className="not-italic font-mono text-xs text-stone-500">({sq.reference})</span>
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            handleSaveQuote({
                              text: sq.text,
                              sourceLabel: 'Bài đọc 1',
                              reference: sq.reference,
                            })
                          }
                          className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                            isPicked
                              ? 'bg-[#1F5E3B] text-white'
                              : 'bg-white border border-stone-300 text-stone-800 hover:border-[#8B261D] hover:text-[#8B261D]'
                          }`}
                        >
                          {isPicked ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                          {isPicked || justSavedRef === sq.reference ? 'Đã lưu vào Ngày sống' : 'Chọn câu này'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </article>

          {/* Đáp ca */}
          <article className="glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
              <p className="text-xs uppercase tracking-widest text-[var(--liturgy-primary)] font-semibold">
                Đáp Ca
              </p>
              <span className="font-mono text-xs text-stone-600">{liturgy.psalm.citation}</span>
            </div>

            <p className="font-serif text-lg font-semibold text-stone-900 leading-relaxed">
              <span className="text-[var(--liturgy-primary)] mr-1">Đ.</span>
              {liturgy.psalm.refrain}
            </p>

            <div className="space-y-4 font-serif text-[17px] text-stone-700 leading-[1.9] max-w-prose">
              {liturgy.psalm.stanzas.map((stanza, i) => (
                <p key={i}>
                  <span className="font-mono text-xs text-[var(--liturgy-primary)] mr-2.5">{i + 1}.</span>
                  {stanza}
                </p>
              ))}
            </div>
          </article>

          {/* Bài đọc 2 (nếu có) */}
          {liturgy.reading2 ? (
            <article className="bg-[#FCFBF8] border border-stone-200/90 shadow-sm rounded-2xl p-7 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-[var(--liturgy-primary)] font-semibold">
                    {liturgy.reading2.label}
                  </p>
                  <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900">
                    {liturgy.reading2.title}
                  </h2>
                </div>
                <span className="font-mono text-xs text-[var(--liturgy-primary)] font-medium">
                  {liturgy.reading2.citation}
                </span>
              </div>

              <p className="font-serif text-sm italic text-[var(--liturgy-primary)]">{liturgy.reading2.intro}</p>

              <div className="space-y-5 font-serif text-[17.5px] sm:text-[18.5px] text-stone-800 leading-[1.95] max-w-prose">
                {liturgy.reading2.verses.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <p className="text-sm font-serif italic text-[var(--liturgy-primary)] pt-2">
                Đó là Lời Chúa. — Tạ ơn Chúa.
              </p>

              {liturgy.reading2.suggestedQuotes.length > 0 && (
                <div className="pt-5 border-t border-stone-200 space-y-2.5">
                  <p className="text-xs text-stone-500">Chọn câu Lời Chúa tâm đắc từ Bài đọc 2 cho Ngày sống:</p>
                  <div className={`grid grid-cols-1 ${liturgy.reading2.suggestedQuotes.length > 1 ? 'sm:grid-cols-2' : ''} gap-3`}>
                    {liturgy.reading2.suggestedQuotes.map((sq) => {
                      const isPicked = entry.chosenQuote?.text === sq.text;
                      return (
                        <div
                          key={sq.reference}
                          className="flex flex-col justify-between gap-3 bg-[#FAF8F4] border border-stone-200 rounded-xl p-3.5"
                        >
                          <p className="font-serif italic text-sm text-stone-700">
                            “{sq.text}” <span className="not-italic font-mono text-xs text-stone-500">({sq.reference})</span>
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveQuote({
                                text: sq.text,
                                sourceLabel: 'Bài đọc 2',
                                reference: sq.reference,
                              })
                            }
                            className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                              isPicked
                                ? 'bg-[#1F5E3B] text-white'
                                : 'bg-white border border-stone-300 text-stone-800 hover:border-[#8B261D] hover:text-[#8B261D]'
                            }`}
                          >
                            {isPicked ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                            {isPicked || justSavedRef === sq.reference ? 'Đã lưu vào Ngày sống' : 'Chọn câu này'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          ) : (
            <div className="news-card rounded-2xl p-6 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Bài đọc 2 (nếu có)
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                Ngày thường trong tuần không có Bài đọc 2; Phụng vụ Lời Chúa gồm Bài đọc 1, Đáp ca và Tin Mừng. (Bài đọc 2 có vào các Chúa Nhật, Lễ Trọng và Lễ Kính).
              </p>
            </div>
          )}

          {/* Tung hô Tin Mừng */}
          <div className="glass-panel rounded-2xl p-6 space-y-1.5">
            <p className="text-xs uppercase tracking-widest text-[var(--liturgy-primary)] font-semibold">
              Tung Hô Tin Mừng
            </p>
            <p className="font-serif italic text-lg text-stone-800 leading-relaxed">
              {liturgy.gospelAcclamation}
            </p>
          </div>

          {/* Tin Mừng */}
          <article className="bg-[#FCFBF8] border border-stone-200/90 shadow-sm rounded-2xl p-7 sm:p-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[var(--liturgy-primary)] font-semibold">
                  {liturgy.gospel.label}
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
                  {liturgy.gospel.title}
                </h2>
              </div>
              <span className="font-mono text-xs text-[var(--liturgy-primary)] font-medium">
                {liturgy.gospel.citation}
              </span>
            </div>

            <p className="font-serif text-sm italic text-[var(--liturgy-primary)]">{liturgy.gospel.intro}</p>

            <div className="space-y-5 font-serif text-[18px] sm:text-[19px] text-stone-900 leading-[1.95] max-w-prose">
              {liturgy.gospel.verses.map((paragraph, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[var(--liturgy-primary)]'
                      : ''
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="text-sm font-serif italic text-[var(--liturgy-primary)] pt-2">
              Đó là Lời Chúa. — Lạy Chúa Kitô, ngợi khen Chúa.
            </p>

            {liturgy.gospel.suggestedQuotes.length > 0 && (
              <div className="pt-5 border-t border-stone-200 space-y-2.5">
                <p className="text-xs text-stone-500">Chọn câu Lời Chúa tâm đắc từ Tin Mừng cho Ngày sống:</p>
                <div className={`grid grid-cols-1 ${liturgy.gospel.suggestedQuotes.length > 1 ? 'sm:grid-cols-2' : ''} gap-3`}>
                  {liturgy.gospel.suggestedQuotes.map((sq) => {
                    const isPicked = entry.chosenQuote?.text === sq.text;
                    return (
                      <div
                        key={sq.reference}
                        className="flex flex-col justify-between gap-3 bg-[#FAF8F4] border border-stone-200 rounded-xl p-3.5"
                      >
                        <p className="font-serif italic text-sm text-stone-700">
                          “{sq.text}” <span className="not-italic font-mono text-xs text-stone-500">({sq.reference})</span>
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            handleSaveQuote({
                              text: sq.text,
                              sourceLabel: 'Tin Mừng',
                              reference: sq.reference,
                            })
                          }
                          className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                            isPicked
                              ? 'bg-[#1F5E3B] text-white'
                              : 'bg-white border border-stone-300 text-stone-800 hover:border-[#8B261D] hover:text-[#8B261D]'
                          }`}
                        >
                          {isPicked ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                          {isPicked || justSavedRef === sq.reference ? 'Đã lưu vào Ngày sống' : 'Chọn câu này'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Right: 4 Liturgical Hymns (Ủy ban Thánh nhạc TGP Hà Nội) + Daily Living Link */}
        <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="neu-surface rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-[var(--liturgy-primary)] font-semibold">
                  Gợi Ý Ủy Ban Thánh Nhạc TGP Hà Nội
                </p>
                <h2 className="font-serif text-2xl font-medium text-stone-900">
                  Các Bài Hát Trong Thánh Lễ
                </h2>
              </div>
              <Music className="w-5 h-5 text-[var(--liturgy-primary)] shrink-0" />
            </div>

            <div className="divide-y divide-stone-200/80">
              {liturgy.hymns.map((hymn) => (
                <div key={hymn.part} className="py-5 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[var(--liturgy-primary)]">{hymn.part}</span>
                    <span className="text-stone-500">{hymn.composer}</span>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-900">
                    {hymn.title}
                  </h3>
                  <p className="font-serif italic text-sm text-stone-600 leading-relaxed">
                    “{hymn.lyricsExcerpt}”
                  </p>
                  <p className="text-xs text-stone-500">{hymn.liturgicalNote}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
              {onOpenLiturgyMusic && (
                <button
                  type="button"
                  onClick={onOpenLiturgyMusic}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--liturgy-primary)] hover:underline cursor-pointer"
                >
                  Xem thêm bài hát Phụng vụ TGP Hà Nội
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <a
                href={HANOI_SACRED_MUSIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[var(--liturgy-primary)]"
              >
                Nguồn TGP Hà Nội
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Bước tiếp theo: Sống Lời Chúa
              </p>
              <h3 className="font-serif text-xl font-medium text-stone-900">
                Câu Lời Chúa cho Ngày sống
              </h3>
            </div>

            {entry.chosenQuote ? (
              <div className="neu-inset rounded-xl p-4 space-y-1.5">
                <p className="font-serif italic text-sm text-stone-800 leading-relaxed">
                  “{entry.chosenQuote.text}”
                </p>
                <p className="text-xs text-stone-500">
                  {entry.chosenQuote.sourceLabel} · {entry.chosenQuote.reference}
                </p>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Hãy bấm “Chọn câu này” ở Bài đọc 1, Bài đọc 2 (nếu có) hoặc Tin Mừng để lưu một câu Lời Chúa làm kim chỉ nam cho quyết tâm hôm nay.
              </p>
            )}

            <button
              type="button"
              onClick={onOpenDailyLiving}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#FBF9F5] rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              style={{ background: 'var(--liturgy-gradient)' }}
            >
              Đặt Quyết tâm &amp; Viết Hồi tâm
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
