import { useState } from 'react';
import { ArrowRight, CalendarSearch, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LiturgicalColor, LiturgicalDay } from '../types/catholic';
import { COLOR_META, formatDateKey, getLiturgicalDay, getMonthCalendarDays, parseDateKey } from '../data/liturgy';

interface CalendarPageProps {
  selectedDateKey: string;
  todayDateKey: string;
  onSelectDate: (dateKey: string) => void;
  onGoToWordOfGod: (dateKey: string) => void;
}

const MONTH_NAMES_VI = [
  'Tháng 01',
  'Tháng 02',
  'Tháng 03',
  'Tháng 04',
  'Tháng 05',
  'Tháng 06',
  'Tháng 07',
  'Tháng 08',
  'Tháng 09',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027, 2028];
const WEEKDAY_HEADERS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const SEASON_GUIDE = [
  {
    name: 'Mùa Vọng',
    color: 'purple' as LiturgicalColor,
    description: '4 tuần chuẩn bị tâm hồn tỉnh thức đón Chúa Giêsu Ngự Đến (Chúa Nhật III mặc áo Hồng).',
  },
  {
    name: 'Mùa Giáng Sinh',
    color: 'white' as LiturgicalColor,
    description: 'Từ Lễ Vọng Giáng Sinh (24/12) đến Lễ Chúa Giêsu Chịu Phép Rửa, mừng Ngôi Lời Nhập Thể.',
  },
  {
    name: 'Mùa Chay',
    color: 'purple' as LiturgicalColor,
    description: 'Từ Thứ Tư Lễ Tro đến trước Thánh lễ Tiệc Ly Thứ Năm Tuần Thánh: ăn chay, cầu nguyện, bố thí.',
  },
  {
    name: 'Mùa Phục Sinh',
    color: 'white' as LiturgicalColor,
    description: '50 ngày hân hoan từ Đại Lễ Phục Sinh đến Lễ Chúa Thánh Thần Hiện Xuống (áo Đỏ ngày Hiện Xuống).',
  },
  {
    name: 'Mùa Thường Niên',
    color: 'green' as LiturgicalColor,
    description: '33–34 tuần suy niệm trọn vẹn cuộc đời và giáo huấn Chúa Giêsu trong đời sống hằng ngày.',
  },
];

export default function CalendarPage({
  selectedDateKey,
  todayDateKey,
  onSelectDate,
  onGoToWordOfGod,
}: CalendarPageProps) {
  const initialDate = parseDateKey(selectedDateKey);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const monthDays = getMonthCalendarDays(viewYear, viewMonth);
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const leadingEmptyCells = Array.from({ length: firstWeekday });

  const selectedDay: LiturgicalDay = getLiturgicalDay(selectedDateKey);
  const selectedColorMeta = COLOR_META[selectedDay.color];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpDate = (dateKey: string) => {
    if (!dateKey) return;
    const target = parseDateKey(dateKey);
    if (Number.isNaN(target.getTime())) return;
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    onSelectDate(dateKey);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Page Header */}
      <div className="border-b border-stone-300/70 pb-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs tracking-wider uppercase text-stone-500">
              Lịch Phụng Vụ Công Giáo
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 leading-tight text-balance">
              Lịch Công Giáo, Các Thánh &amp; Màu Áo Lễ Hằng Ngày
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Tra cứu linh hoạt theo ngày, tháng, năm để xem trước hoặc xem lại lễ kính, các Thánh, mùa phụng vụ, bậc lễ và màu áo lễ.
            </p>
          </div>

          {/* Quick Feast Jumps */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleJumpDate(todayDateKey)}
              className="px-3.5 py-2 text-xs font-medium text-[#FBF9F5] rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              style={{ background: 'var(--liturgy-gradient)' }}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => handleJumpDate('2026-11-22')}
              className="px-3.5 py-2 text-xs font-medium neu-surface-sm text-stone-700 hover:text-[var(--liturgy-primary)] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Chúa Kitô Vua (22/11)
            </button>
            <button
              type="button"
              onClick={() => handleJumpDate('2026-11-24')}
              className="px-3.5 py-2 text-xs font-medium neu-surface-sm text-stone-700 hover:text-[var(--liturgy-primary)] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Các Thánh Tử Đạo VN (24/11)
            </button>
            <button
              type="button"
              onClick={() => handleJumpDate('2026-11-29')}
              className="px-3.5 py-2 text-xs font-medium neu-surface-sm text-stone-700 hover:text-[var(--liturgy-primary)] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              CN I Mùa Vọng (29/11)
            </button>
            <button
              type="button"
              onClick={() => handleJumpDate('2026-11-02')}
              className="px-3.5 py-2 text-xs font-medium neu-surface-sm text-stone-700 hover:text-[var(--liturgy-primary)] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Lễ Cầu Hồn (02/11)
            </button>
            <button
              type="button"
              onClick={() => handleJumpDate('2026-12-25')}
              className="px-3.5 py-2 text-xs font-medium neu-surface-sm text-stone-700 hover:text-[var(--liturgy-primary)] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Giáng Sinh (25/12)
            </button>
          </div>
        </div>

        {/* Flexible Date / Month / Year Filter Bar */}
        <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B365D]">
              <CalendarSearch className="w-4 h-4 text-[#8B261D]" />
              Bộ lọc ngày &amp; tra cứu nhanh:
            </span>

            <select
              aria-label="Chọn tháng"
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-medium neu-inset rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
            >
              {MONTH_NAMES_VI.map((mName, idx) => (
                <option key={mName} value={idx}>
                  {mName}
                </option>
              ))}
            </select>

            <select
              aria-label="Chọn năm"
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-medium font-mono neu-inset rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
            >
              {YEAR_OPTIONS.map((yr) => (
                <option key={yr} value={yr}>
                  Năm {yr}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-stone-600">
            <span>Đi thẳng tới ngày:</span>
            <input
              type="date"
              value={selectedDateKey}
              onChange={(e) => handleJumpDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono neu-inset rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
            />
          </label>
        </div>
      </div>

      {/* Main Split: Calendar Grid (7 cols) + Liturgical Dossier (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Matrix */}
        <div className="lg:col-span-7 neu-surface rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium text-stone-900 tabular-nums">
              {MONTH_NAMES_VI[viewMonth]}, {viewYear}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-9 h-9 inline-flex items-center justify-center neu-inset rounded-lg text-stone-700 hover:text-[#8B261D] cursor-pointer"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-9 h-9 inline-flex items-center justify-center neu-inset rounded-lg text-stone-700 hover:text-[#8B261D] cursor-pointer"
                aria-label="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-stone-200/80 bg-[#F4F0E8]/60">
            {WEEKDAY_HEADERS.map((wd, idx) => (
              <div
                key={wd}
                className={`py-2.5 text-center text-xs font-medium ${
                  idx === 0 ? 'text-[#8B261D]' : 'text-stone-500'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-white/80">
            {leadingEmptyCells.map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[88px] sm:min-h-[100px] border-b border-r border-stone-200/60 bg-stone-100/40"
              />
            ))}

            {monthDays.map((dayItem) => {
              const dNum = Number(dayItem.dateKey.split('-')[2]);
              const isSelected = dayItem.dateKey === selectedDateKey;
              const isToday = dayItem.dateKey === todayDateKey;
              const isSunday = parseDateKey(dayItem.dateKey).getDay() === 0;
              const cMeta = COLOR_META[dayItem.color];

              return (
                <button
                  key={dayItem.dateKey}
                  type="button"
                  onClick={() => onSelectDate(dayItem.dateKey)}
                  className={`relative min-h-[88px] sm:min-h-[100px] p-2 pt-3 text-left border-b border-r border-stone-200/60 flex flex-col justify-between transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--liturgy-primary)] ${
                    isSelected
                      ? 'neu-inset ring-2 ring-inset ring-[var(--liturgy-primary)]'
                      : 'hover:bg-[#F7F4EC]'
                  }`}
                >
                  {/* Top Liturgical Color Ribbon Strip */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: cMeta.hex }}
                  />

                  <div className="flex items-center justify-between w-full gap-1">
                    <span
                      className={`text-sm font-medium tabular-nums ${
                        isToday
                          ? 'text-[#8B261D] underline underline-offset-4 font-semibold'
                          : isSunday
                          ? 'text-[#8B261D]'
                          : 'text-stone-900'
                      }`}
                    >
                      {dNum}
                    </span>
                    <span
                      className="text-[10px] font-medium text-stone-500 truncate"
                      title={`Áo lễ màu ${dayItem.colorNameVi}`}
                    >
                      {dayItem.colorNameVi.split(' ')[0]}
                    </span>
                  </div>

                  <div className="space-y-0.5 mt-1">
                    {(dayItem.rank === 'Lễ Trọng' ||
                      dayItem.rank === 'Lễ Kính' ||
                      dayItem.rank === 'Lễ Nhớ' ||
                      dayItem.rank === 'Chúa Nhật') && (
                      <p className="text-[10px] font-semibold text-[#8B261D] truncate">
                        {dayItem.rank}
                      </p>
                    )}
                    <p className="text-[11px] leading-tight text-stone-700 line-clamp-2">
                      {dayItem.feastTitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Liturgical Dossier */}
        <aside className="lg:col-span-5 neu-surface rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-3 border-b border-stone-200/80 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-medium text-stone-800">{selectedDay.weekdayLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono">{selectedDay.solarDateLabel}</span>
                {selectedDay.dateKey === todayDateKey && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#8B261D]">Hôm nay</span>
                  </>
                )}
              </div>

              {/* Distinct Liturgical Color Badge right beside Day Header */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-stone-300 text-stone-900">
                <span
                  className="w-2.5 h-2.5 rounded-xs border shrink-0"
                  style={{
                    backgroundColor: selectedColorMeta.hex,
                    borderColor: selectedColorMeta.borderHex,
                  }}
                  aria-hidden="true"
                />
                Áo lễ {selectedDay.colorNameVi}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <span
                className="w-1.5 self-stretch rounded-full shrink-0 mt-1"
                style={{ backgroundColor: selectedColorMeta.hex }}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 leading-snug">
                  {selectedDay.feastTitle}
                </h2>
                <p className="text-sm text-stone-600">{selectedDay.seasonDetail}</p>
              </div>
            </div>
          </div>

          <dl className="divide-y divide-stone-200/80 text-sm">
            <div className="py-3 flex items-start justify-between gap-4">
              <dt className="text-stone-500 shrink-0">Mùa phụng vụ</dt>
              <dd className="font-medium text-stone-900 text-right">{selectedDay.season}</dd>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <dt className="text-stone-500 shrink-0">Bậc lễ</dt>
              <dd className="font-medium text-stone-900 text-right">{selectedDay.rank}</dd>
            </div>

            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-stone-500 shrink-0">Áo lễ màu</dt>
                <dd className="flex items-center gap-2 font-medium text-stone-900">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-xs border"
                    style={{
                      backgroundColor: selectedColorMeta.hex,
                      borderColor: selectedColorMeta.borderHex,
                    }}
                    aria-hidden="true"
                  />
                  <span>{selectedDay.colorNameVi}</span>
                </dd>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {selectedDay.colorMeaning}
              </p>
            </div>
          </dl>

          <div className="space-y-3 pt-2 border-t border-stone-200/80">
            <h3 className="font-serif text-lg font-medium text-stone-900">
              Các Thánh &amp; Ý nghĩa trong ngày
            </h3>
            <div className={`grid grid-cols-1 ${selectedDay.saints.length > 1 ? 'sm:grid-cols-2' : ''} gap-3`}>
              {selectedDay.saints.map((saint) => (
                <div key={saint.name} className="bg-[#FAF8F4] border border-stone-200 rounded-xl p-4 space-y-1">
                  <p className="font-serif text-base font-medium text-stone-900">
                    {saint.name}
                  </p>
                  <p className="text-xs text-[#8B261D]">{saint.role}</p>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                    {saint.biography}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-stone-200/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Chỉ dẫn phụng vụ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedDay.liturgicalNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F4] border border-stone-200 rounded-lg p-3 space-y-1 text-xs text-stone-700 leading-relaxed"
                >
                  <span className="block font-mono text-[11px] font-semibold text-[#8B261D]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p>{note}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onGoToWordOfGod(selectedDay.dateKey)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#FBF9F5] rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: 'var(--liturgy-gradient)' }}
          >
            Xem Lời Chúa &amp; Thánh ca ngày {formatDateKey(parseDateKey(selectedDay.dateKey)).split('-').reverse().join('/')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </aside>
      </div>

      {/* Liturgical Reference Guide */}
      <section className="border-t border-stone-300/70 pt-12 space-y-8">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
            Ý nghĩa Màu Áo Lễ &amp; Các Mùa Phụng Vụ
          </h2>
          <p className="text-sm text-stone-600">
            Phụng vụ Rôma sử dụng năm màu áo lễ chính cùng hệ thống các bậc lễ để giúp tín hữu cảm nhận nhịp điệu của mầu nhiệm cứu độ suốt năm.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(Object.keys(COLOR_META) as LiturgicalColor[]).map((key) => {
            const item = COLOR_META[key];
            return (
              <div
                key={key}
                className="neu-surface-sm rounded-xl p-5 space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-xs border shrink-0"
                    style={{ backgroundColor: item.hex, borderColor: item.borderHex }}
                    aria-hidden="true"
                  />
                  <h3 className="font-serif text-base font-medium text-stone-900">
                    Màu {item.nameVi}
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{item.meaning}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {SEASON_GUIDE.map((season) => {
            const c = COLOR_META[season.color];
            return (
              <div key={season.name} className="news-card rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-base font-medium text-stone-900">
                    {season.name}
                  </h3>
                  <span
                    className="w-2.5 h-2.5 rounded-xs border shrink-0"
                    style={{ backgroundColor: c.hex, borderColor: c.borderHex }}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{season.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
