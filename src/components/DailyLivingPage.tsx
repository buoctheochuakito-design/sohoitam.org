import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  History,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Unlock,
} from 'lucide-react';
import type {
  AiGospelExamen,
  DailyLivingEntry,
  GmailAccountMeta,
  LiturgicalDay,
} from '../types/catholic';
import {
  DAILY_MORNING_OFFERING,
  MONTHLY_PAPAL_INTENTIONS,
  getDailyPrayerFocus,
} from '../data/prayerIntentions';
import {
  clearJournalPin,
  hasPinConfigured,
  loginGmailAccount,
  setJournalPin,
  verifyJournalPin,
} from '../utils/journalStorage';
import { parseDateKey } from '../data/liturgy';

interface DailyLivingPageProps {
  liturgy: LiturgicalDay;
  entry: DailyLivingEntry;
  allEntries: Record<string, DailyLivingEntry>;
  scrollToExamenSignal: number;
  activeAccount: GmailAccountMeta | null;
  isVaultUnlocked: boolean;
  onOpenAuth: () => void;
  onAuthSuccess: (payload: {
    account: GmailAccountMeta;
    aesKey: CryptoKey;
    entries: Record<string, DailyLivingEntry>;
  }) => void;
  onLockVault: () => void;
  onLogout: () => void;
  onUpdateEntry: (updated: DailyLivingEntry) => void;
  onSelectDate: (dateKey: string) => void;
}

const RESOLUTION_CATEGORIES: DailyLivingEntry['resolutionCategory'][] = [
  'Bố thí & Bác ái',
  'Cầu nguyện',
  'Hãm mình & Nhẫn nại',
  'Thăm viếng & Tha thứ',
];

const RESOLUTION_TEMPLATES: Record<DailyLivingEntry['resolutionCategory'], string[]> = {
  'Bố thí & Bác ái': [
    'Âm thầm chia sẻ một phần thu nhập / bữa ăn cho người nghèo hoặc quỹ bác ái giáo xứ.',
    'Giúp đỡ một đồng nghiệp hoặc người thân đang gặp khó khăn mà không kể công.',
  ],
  'Cầu nguyện': [
    'Dành 15 phút thinh lặng buổi tối cầu nguyện trước Thánh Giá hoặc lần một chuỗi Mân Côi.',
    'Dâng lời cầu nguyện cho một người đang làm mình buồn lòng hoặc gặp thử thách.',
  ],
  'Hãm mình & Nhẫn nại': [
    'Giữ thinh lặng và đáp lại bằng lời hiền hòa khi gặp chuyện trái ý trong ngày.',
    'Bớt thời gian lướt mạng vô bổ để dành trọn vẹn sự chú tâm cho gia đình.',
  ],
  'Thăm viếng & Tha thứ': [
    'Chủ động gọi điện hỏi thăm ông bà, cha mẹ hoặc một người bạn đang cô đơn.',
    'Chủ động làm hòa và tha thứ tận đáy lòng cho một hiềm khích cũ.',
  ],
};

export default function DailyLivingPage({
  liturgy,
  entry,
  allEntries,
  scrollToExamenSignal,
  activeAccount,
  isVaultUnlocked,
  onOpenAuth,
  onAuthSuccess,
  onLockVault,
  onLogout,
  onUpdateEntry,
  onSelectDate,
}: DailyLivingPageProps) {
  const examenSectionRef = useRef<HTMLElement | null>(null);

  const monthNum = Number(liturgy.dateKey.split('-')[1]);
  const [selectedIntentionMonth, setSelectedIntentionMonth] = useState(monthNum);

  const [customQuoteText, setCustomQuoteText] = useState('');
  const [customQuoteSource, setCustomQuoteSource] = useState<'Bài đọc 1' | 'Bài đọc 2' | 'Tin Mừng'>('Tin Mừng');
  const [customQuoteRef, setCustomQuoteRef] = useState('');
  const [showCustomQuoteForm, setShowCustomQuoteForm] = useState(false);

  const [savedNotice, setSavedNotice] = useState(false);

  const [pinConfigured, setPinConfigured] = useState(() => hasPinConfigured());
  const [isUnlocked, setIsUnlocked] = useState(() => !hasPinConfigured());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSetupError, setPinSetupError] = useState('');
  const [showPinDigits, setShowPinDigits] = useState(false);

  const [vaultPassword, setVaultPassword] = useState('');
  const [vaultUnlockError, setVaultUnlockError] = useState('');
  const [unlockingVault, setUnlockingVault] = useState(false);

  // AI Gospel Reflection & 3-4 Examen Questions state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [sessionAiMap, setSessionAiMap] = useState<Record<string, AiGospelExamen>>({});
  const autoRequestedRef = useRef<Set<string>>(new Set());
  const latestEntryRef = useRef(entry);
  const latestUpdateRef = useRef(onUpdateEntry);

  useEffect(() => {
    latestEntryRef.current = entry;
  }, [entry]);

  useEffect(() => {
    latestUpdateRef.current = onUpdateEntry;
  }, [onUpdateEntry]);

  useEffect(() => {
    setSelectedIntentionMonth(Number(liturgy.dateKey.split('-')[1]));
  }, [liturgy.dateKey]);

  useEffect(() => {
    if (scrollToExamenSignal > 0 && examenSectionRef.current) {
      examenSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToExamenSignal]);

  const generateAiReflection = useCallback(
    async (forceRegenerate = false) => {
      setAiLoading(true);
      setAiError(null);
      try {
        const response = await fetch('/api/ai/examen-reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dateKey: liturgy.dateKey,
            feastTitle: liturgy.feastTitle,
            season: liturgy.season,
            gospelCitation: liturgy.gospel.citation,
            gospelTitle: liturgy.gospel.title,
            gospelVerses: liturgy.gospel.verses,
            forceRegenerate,
          }),
        });
        const data = (await response.json()) as Partial<AiGospelExamen> & { error?: string };
        if (!response.ok || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error(data.error || 'Chưa thể kết nối AI soạn câu hỏi phản tỉnh lúc này.');
        }

        const aiPayload: AiGospelExamen = {
          theme: data.theme || liturgy.gospelReflection.theme,
          reflectionSummary:
            data.reflectionSummary || liturgy.gospelReflection.paragraphs.join(' '),
          prayerPrompt: data.prayerPrompt || liturgy.gospelReflection.prayerPrompt,
          questions: data.questions.slice(0, 4),
          generatedAt: data.generatedAt || new Date().toISOString(),
        };

        setSessionAiMap((prev) => ({ ...prev, [liturgy.dateKey]: aiPayload }));

        if (isVaultUnlocked && isUnlocked) {
          latestUpdateRef.current({
            ...latestEntryRef.current,
            aiReflection: aiPayload,
          });
        }
      } catch (err) {
        setAiError(
          err instanceof Error
            ? err.message
            : 'Không thể tạo câu hỏi phản tỉnh AI lúc này.'
        );
      } finally {
        setAiLoading(false);
      }
    },
    [
      isUnlocked,
      isVaultUnlocked,
      liturgy.dateKey,
      liturgy.feastTitle,
      liturgy.gospel.citation,
      liturgy.gospel.title,
      liturgy.gospel.verses,
      liturgy.gospelReflection.paragraphs,
      liturgy.gospelReflection.prayerPrompt,
      liturgy.gospelReflection.theme,
      liturgy.season,
    ]
  );

  useEffect(() => {
    if (!isVaultUnlocked || !isUnlocked) return;
    if (entry.aiReflection?.questions?.length || sessionAiMap[liturgy.dateKey]) return;

    const reqKey = `${activeAccount?.emailHash || 'guest'}::${liturgy.dateKey}`;
    if (autoRequestedRef.current.has(reqKey)) return;
    autoRequestedRef.current.add(reqKey);
    void generateAiReflection(false);
  }, [
    activeAccount?.emailHash,
    entry.aiReflection,
    generateAiReflection,
    isUnlocked,
    isVaultUnlocked,
    liturgy.dateKey,
    sessionAiMap,
  ]);

  const activeAiReflection = entry.aiReflection || sessionAiMap[liturgy.dateKey] || null;
  const activeQuestions =
    activeAiReflection?.questions && activeAiReflection.questions.length > 0
      ? activeAiReflection.questions
      : liturgy.examenQuestions;

  const monthlyIntention =
    MONTHLY_PAPAL_INTENTIONS.find((m) => m.month === selectedIntentionMonth) ||
    MONTHLY_PAPAL_INTENTIONS[10];

  const dailyPrayerFocus = getDailyPrayerFocus(
    liturgy.dateKey,
    liturgy.feastTitle,
    liturgy.season
  );

  const readingSuggestedQuotes = [
    ...liturgy.reading1.suggestedQuotes.map((q) => ({
      ...q,
      sourceLabel: 'Bài đọc 1',
    })),
    ...(liturgy.reading2
      ? liturgy.reading2.suggestedQuotes.map((q) => ({
          ...q,
          sourceLabel: 'Bài đọc 2',
        }))
      : []),
    ...liturgy.gospel.suggestedQuotes.map((q) => ({
      ...q,
      sourceLabel: 'Tin Mừng',
    })),
  ];

  const pastJournalEntries = Object.values(allEntries)
    .filter(
      (item) =>
        item.dateKey !== liturgy.dateKey &&
        (item.journalNote.trim() ||
          item.resolutionText.trim() ||
          item.gospelReflectionNote?.trim() ||
          item.chosenQuote ||
          Object.values(item.examenResponses).some((v) => v.trim()))
    )
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  const triggerSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSaveCustomQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuoteText.trim()) return;
    onUpdateEntry({
      ...entry,
      chosenQuote: {
        text: customQuoteText.trim(),
        sourceLabel: customQuoteSource,
        reference: customQuoteRef.trim() || 'Lời Chúa hôm nay',
      },
    });
    setCustomQuoteText('');
    setCustomQuoteRef('');
    setShowCustomQuoteForm(false);
    triggerSaveNotice();
  };

  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const ok = await verifyJournalPin(pinInput);
    if (ok) {
      setIsUnlocked(true);
      setPinInput('');
    } else {
      setPinError('Mã khóa chưa đúng. Vui lòng kiểm tra lại.');
    }
  };

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinSetupError('');
    if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      setPinSetupError('Mã khóa phải gồm từ 4 đến 6 chữ số.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinSetupError('Hai lần nhập mã khóa chưa khớp.');
      return;
    }
    await setJournalPin(newPin);
    setPinConfigured(true);
    setIsUnlocked(true);
    setNewPin('');
    setConfirmPin('');
    setShowPinSetupModal(false);
  };

  const handleRemovePin = () => {
    clearJournalPin();
    setPinConfigured(false);
    setIsUnlocked(true);
    setShowPinSetupModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
      {/* 1. Header Banner */}
      <div className="border-b border-stone-300/70 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="font-medium text-stone-800">{liturgy.weekdayLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{liturgy.solarDateLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{liturgy.feastTitle}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 leading-tight text-balance">
            Ngày Sống: Cầu Nguyện, Quyết Tâm &amp; Hồi Tâm
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
            Hiệp thông với ý cầu nguyện của Đức Thánh Cha, khắc ghi một câu Lời Chúa tâm đắc, đề ra hành động quyết tâm cụ thể và viết lại nhật ký hồi tâm riêng tư dưới ánh sáng Tin Mừng.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="aspect-[16/10] neu-surface rounded-2xl overflow-hidden p-2">
            <img
              src="/src/assets/images/daily_living_prayer_1794840222871.jpg"
              alt="Cuốn nhật ký hồi tâm và thánh giá gỗ ô-liu bên ánh nắng sớm"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* 2. Ý chỉ Mạng Lưới Cầu Nguyện cùng Đức Thánh Cha */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Mạng Lưới Cầu Nguyện Toàn Cầu của Đức Thánh Cha
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
              Ý Chỉ Cầu Nguyện Theo Tháng &amp; Theo Ngày
            </h2>
          </div>

          <label className="flex items-center gap-2 text-xs text-stone-600">
            <span>Xem tháng:</span>
            <select
              value={selectedIntentionMonth}
              onChange={(e) => setSelectedIntentionMonth(Number(e.target.value))}
              className="px-3 py-2 neu-surface-sm rounded-lg text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--liturgy-primary)]"
            >
              {MONTHLY_PAPAL_INTENTIONS.map((m) => (
                <option key={m.month} value={m.month}>
                  {m.monthNameVi}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 neu-surface rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]">
                Ý chỉ theo Tháng · {monthlyIntention.monthNameVi}
              </span>
              <Heart className="w-4 h-4 text-[var(--liturgy-primary)]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-stone-900">
              {monthlyIntention.title}
            </h3>
            <p className="font-serif text-base text-stone-700 leading-relaxed">
              “{monthlyIntention.prayerText}”
            </p>
            <p className="text-xs text-stone-500 pt-1">{monthlyIntention.contextNote}</p>
          </div>

          <div className="lg:col-span-6 glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]">
                  Ý chỉ theo Ngày · {liturgy.solarDateLabel}
                </span>
              </div>
              <p className="text-sm font-medium text-stone-900 leading-relaxed">
                {dailyPrayerFocus}
              </p>
              <div className="neu-inset rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-medium text-stone-500">Kinh Dâng Ngày</p>
                <p className="font-serif italic text-sm text-stone-700 leading-relaxed">
                  {DAILY_MORNING_OFFERING}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onUpdateEntry({
                  ...entry,
                  morningOfferingDone: !entry.morningOfferingDone,
                });
                triggerSaveNotice();
              }}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                entry.morningOfferingDone
                  ? 'bg-[#1F5E3B] text-white'
                  : 'neu-surface-sm text-stone-800 hover:text-[#8B261D]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {entry.morningOfferingDone
                ? 'Đã dâng ngày cầu nguyện hiệp thông hôm nay'
                : 'Xác nhận dâng ngày hôm nay'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Câu Lời Chúa Tự Chọn & Quyết Tâm Cụ Thể */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 neu-surface rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-stone-200/80 pb-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-[var(--liturgy-primary)] font-semibold">
                Câu Lời Chúa Trong Ngày
              </p>
              <h2 className="font-serif text-2xl font-medium text-stone-900">
                1 Câu Lời Chúa Tự Chọn Hay Nhất
              </h2>
            </div>
            <BookMarked className="w-5 h-5 text-[var(--liturgy-primary)] shrink-0" />
          </div>

          {entry.chosenQuote ? (
            <div className="neu-inset rounded-xl p-5 space-y-2">
              <p className="font-serif italic text-lg text-stone-900 leading-relaxed">
                “{entry.chosenQuote.text}”
              </p>
              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>
                  {entry.chosenQuote.sourceLabel} · {entry.chosenQuote.reference}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateEntry({ ...entry, chosenQuote: null })}
                  className="text-[var(--liturgy-primary)] hover:underline cursor-pointer"
                >
                  Đổi câu khác
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-600">
              Chọn một câu đánh động lòng bạn nhất từ Bài đọc 1, Bài đọc 2 (nếu có) hoặc Tin Mừng hôm nay:
            </p>
          )}

          <div className="space-y-2.5">
            <p className="text-xs font-medium text-stone-500">
              Gợi ý từ Phụng vụ hôm nay ({liturgy.feastTitle}):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {readingSuggestedQuotes.map((sq) => {
                const selected = entry.chosenQuote?.text === sq.text;
                return (
                  <button
                    key={`${sq.sourceLabel}-${sq.reference}`}
                    type="button"
                    onClick={() => {
                      onUpdateEntry({
                        ...entry,
                        chosenQuote: {
                          text: sq.text,
                          sourceLabel: sq.sourceLabel,
                          reference: sq.reference,
                        },
                      });
                      triggerSaveNotice();
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex flex-col justify-between ${
                      selected
                        ? 'neu-inset ring-1 ring-[var(--liturgy-primary)]'
                        : 'bg-[#FAF8F4] border border-stone-200 hover:border-[var(--liturgy-primary)]/40'
                    }`}
                  >
                    <p className="font-serif italic text-sm text-stone-800 leading-relaxed">
                      “{sq.text}”
                    </p>
                    <p className="text-xs text-stone-500 mt-1.5">
                      {sq.sourceLabel} · {sq.reference}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200/80">
            {!showCustomQuoteForm ? (
              <button
                type="button"
                onClick={() => setShowCustomQuoteForm(true)}
                className="text-xs font-medium text-[var(--liturgy-primary)] hover:underline cursor-pointer"
              >
                + Tự nhập câu Lời Chúa khác bạn tâm đắc
              </button>
            ) : (
              <form onSubmit={handleSaveCustomQuote} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={customQuoteSource}
                    onChange={(e) =>
                      setCustomQuoteSource(e.target.value as 'Bài đọc 1' | 'Bài đọc 2' | 'Tin Mừng')
                    }
                    className="px-3 py-2 text-xs neu-inset rounded-lg text-stone-900"
                  >
                    <option value="Bài đọc 1">Bài đọc 1</option>
                    <option value="Bài đọc 2">Bài đọc 2</option>
                    <option value="Tin Mừng">Tin Mừng</option>
                  </select>
                  <input
                    type="text"
                    value={customQuoteRef}
                    onChange={(e) => setCustomQuoteRef(e.target.value)}
                    placeholder="Trích dẫn (vd: Lc 18, 42)"
                    className="px-3 py-2 text-xs neu-inset rounded-lg text-stone-900"
                  />
                </div>
                <textarea
                  rows={2}
                  value={customQuoteText}
                  onChange={(e) => setCustomQuoteText(e.target.value)}
                  placeholder="Chép lại câu Lời Chúa đánh động bạn nhất..."
                  className="w-full px-3 py-2 text-sm neu-inset rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--liturgy-primary)]"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium bg-[var(--liturgy-primary)] text-white rounded-lg hover:opacity-90 cursor-pointer"
                  >
                    Lưu câu Lời Chúa
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomQuoteForm(false)}
                    className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Quyết tâm cụ thể */}
        <div className="lg:col-span-6 neu-surface rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1 border-b border-stone-200/80 pb-4">
            <p className="text-xs uppercase tracking-wider text-[var(--liturgy-primary)] font-semibold">
              Thực Hành Lời Chúa
            </p>
            <h2 className="font-serif text-2xl font-medium text-stone-900">
              Quyết Tâm Cụ Thể Hôm Nay
            </h2>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-stone-500">Lĩnh vực thực hành:</p>
            <div className="flex flex-wrap gap-2">
              {RESOLUTION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    onUpdateEntry({
                      ...entry,
                      resolutionCategory: cat,
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    entry.resolutionCategory === cat
                      ? 'bg-[var(--liturgy-primary)] text-white shadow-xs'
                      : 'neu-inset text-stone-700 hover:text-[var(--liturgy-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-stone-500">
              Gợi ý hành động ({entry.resolutionCategory}):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RESOLUTION_TEMPLATES[entry.resolutionCategory].map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => {
                    onUpdateEntry({
                      ...entry,
                      resolutionText: tpl,
                    });
                    triggerSaveNotice();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-stone-700 bg-[#FAF8F4] border border-stone-200 hover:border-[#8B261D]/40 rounded-xl cursor-pointer transition-colors"
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="resolution-input" className="block text-xs font-medium text-stone-700">
              Quyết tâm cụ thể của riêng bạn hôm nay:
            </label>
            <textarea
              id="resolution-input"
              rows={3}
              value={entry.resolutionText}
              onChange={(e) =>
                onUpdateEntry({
                  ...entry,
                  resolutionText: e.target.value,
                })
              }
              placeholder="Ví dụ: Bố thí âm thầm 50.000đ cho người bán vé số trước cổng nhà thờ / Dành 15 phút cầu nguyện tối nay..."
              className="w-full px-3.5 py-2.5 text-sm neu-inset rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200/80">
            <button
              type="button"
              onClick={() => {
                onUpdateEntry({
                  ...entry,
                  resolutionCompleted: !entry.resolutionCompleted,
                });
                triggerSaveNotice();
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                entry.resolutionCompleted
                  ? 'bg-[#1F5E3B] text-white'
                  : 'neu-surface-sm text-stone-800 hover:text-[#8B261D]'
              }`}
            >
              <Check className="w-4 h-4" />
              {entry.resolutionCompleted ? 'Đã hoàn thành quyết tâm hôm nay' : 'Đánh dấu đã thực hiện'}
            </button>

            {savedNotice && (
              <span className="text-xs text-[#1F5E3B] font-medium">
                Đã lưu tự động trên thiết bị
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 4. Hồi tâm — Nhật ký riêng tư lồng ghép Suy niệm Tin Mừng & câu hỏi xét mình */}
      <section ref={examenSectionRef} id="hoi-tam" className="space-y-6 pt-4 border-t border-stone-300/70">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs uppercase tracking-wider text-[var(--liturgy-primary)] font-semibold">
              Nhật Ký Thiêng Liêng Riêng Tư
            </p>
            <h2 className="font-serif text-3xl font-medium text-stone-900">
              Suy Niệm Tin Mừng &amp; Hồi Tâm Cuối Ngày
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Không gian riêng tư lưu giữ trên tài khoản Gmail đã mã hóa (hoặc cục bộ), kết hợp chuyên mục Suy niệm Tin Mừng hôm nay và 5 bước hồi tâm cổ truyền.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {pinConfigured ? (
              <>
                {isUnlocked && (
                  <button
                    type="button"
                    onClick={() => setIsUnlocked(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[var(--liturgy-primary)] text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Khóa nhật ký ngay
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPinSetupModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium neu-surface-sm text-stone-700 rounded-lg hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Đổi / Tắt mã khóa
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowPinSetupModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium neu-surface-sm text-stone-900 rounded-lg hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[var(--liturgy-primary)]" />
                Đặt mã khóa chống đọc lén
              </button>
            )}
          </div>
        </div>

        {/* Gmail Per-Account Encrypted Vault Bar */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[var(--liturgy-tint)] text-[var(--liturgy-primary)] flex items-center justify-center shrink-0">
              {activeAccount ? <ShieldCheck className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>
            <div className="min-w-0 space-y-0.5">
              {activeAccount ? (
                <>
                  <p className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                    Kho Hồi tâm riêng cho Gmail: <span className="font-mono text-[var(--liturgy-primary)]">{activeAccount.email}</span>
                  </p>
                  <p className="text-xs text-stone-500">
                    {isVaultUnlocked
                      ? 'Đã giải mã · Toàn bộ Suy niệm Tin Mừng, Hồi tâm và Quyết tâm được mã hóa AES-256-GCM tách biệt cho tài khoản này.'
                      : 'Đang khóa · Nhập mật khẩu của Gmail này bên dưới để giải mã nội dung Hồi tâm riêng.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm font-semibold text-stone-900">
                    Chế độ khách (chưa đăng nhập Gmail)
                  </p>
                  <p className="text-xs text-stone-500">
                    Đăng nhập hoặc tạo tài khoản Gmail để mã hóa AES-256-GCM và tách riêng phần Hồi tâm cho từng địa chỉ Gmail.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeAccount ? (
              <>
                {isVaultUnlocked && (
                  <button
                    type="button"
                    onClick={onLockVault}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FAF8F4] border border-stone-300 text-stone-800 hover:border-[var(--liturgy-primary)] hover:text-[var(--liturgy-primary)] rounded-lg cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Khóa kho Gmail
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-stone-300 text-stone-800 hover:border-[var(--liturgy-primary)] rounded-lg cursor-pointer"
                >
                  Đổi Gmail
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--liturgy-primary)] hover:underline cursor-pointer"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'var(--liturgy-gradient)' }}
              >
                <Mail className="w-3.5 h-3.5" />
                Đăng nhập / Tạo tài khoản Gmail
              </button>
            )}
          </div>
        </div>

        {activeAccount && !isVaultUnlocked ? (
          <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-10 max-w-lg mx-auto text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F4] border border-stone-200 flex items-center justify-center mx-auto text-[#8B261D]">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl font-semibold text-stone-900">
                Mở Khóa Hồi Tâm Của Bạn
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Nhập mật khẩu mã hóa cho tài khoản <strong className="font-mono text-stone-900">{activeAccount.email}</strong> để giải mã nhật ký Hồi tâm riêng tư.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setVaultUnlockError('');
                setUnlockingVault(true);
                try {
                  const res = await loginGmailAccount(activeAccount.email, vaultPassword);
                  onAuthSuccess(res);
                  setVaultPassword('');
                } catch (err) {
                  setVaultUnlockError(
                    err instanceof Error ? err.message : 'Mật khẩu giải mã không đúng.'
                  );
                } finally {
                  setUnlockingVault(false);
                }
              }}
              className="space-y-4 max-w-xs mx-auto"
            >
              <input
                type="password"
                required
                value={vaultPassword}
                onChange={(e) => setVaultPassword(e.target.value)}
                placeholder="Nhập mật khẩu Gmail..."
                className="w-full px-4 py-2.5 text-sm bg-[#FAF8F4] border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
              />
              {vaultUnlockError && (
                <p className="text-xs text-[#8B261D]">{vaultUnlockError}</p>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={unlockingVault}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#8B261D] hover:bg-[#6E1D15] text-white rounded-lg cursor-pointer disabled:opacity-60"
                >
                  <Unlock className="w-4 h-4" />
                  {unlockingVault ? 'Đang giải mã...' : 'Giải mã & Mở Hồi tâm'}
                </button>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs text-stone-600 hover:text-[#8B261D] cursor-pointer py-1"
                >
                  Đăng nhập tài khoản Gmail khác
                </button>
              </div>
            </form>
          </div>
        ) : !isUnlocked ? (
          <div className="glass-panel rounded-2xl p-8 sm:p-12 max-w-lg mx-auto text-center space-y-6">
            <div className="w-12 h-12 rounded-full neu-inset flex items-center justify-center mx-auto text-[#8B261D]">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-medium text-stone-900">
                Nhật Ký Hồi Tâm Đang Được Khóa
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Nhập mã PIN cá nhân (4–6 chữ số) của bạn để mở xem và viết nhật ký ngày sống hôm nay.
              </p>
            </div>

            <form onSubmit={handleUnlockPin} className="space-y-4">
              <div className="relative max-w-xs mx-auto">
                <input
                  type={showPinDigits ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Nhập mã PIN..."
                  className="w-full px-4 py-2.5 text-center tracking-widest font-mono text-base neu-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPinDigits((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 cursor-pointer"
                  aria-label={showPinDigits ? 'Ẩn mã PIN' : 'Hiện mã PIN'}
                >
                  {showPinDigits ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && <p className="text-xs text-[#8B261D]">{pinError}</p>}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#8B261D] text-white rounded-xl hover:bg-[#6E1D15] cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                Mở khóa nhật ký
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Chuyên mục Suy Niệm Tin Mừng (AI cá nhân hóa theo Tin Mừng ngày) */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
              <div
                className="px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3"
                style={{ background: 'var(--liturgy-gradient)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-white/85 font-semibold flex items-center gap-1.5">
                      <span>Suy Niệm Tin Mừng Hôm Nay · {liturgy.feastTitle}</span>
                      {activeAiReflection && (
                        <span className="inline-flex items-center gap-1 text-white/95">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      )}
                    </p>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
                      {activeAiReflection?.theme || liturgy.gospelReflection.theme}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono text-xs text-white/90">
                    {liturgy.gospel.citation}
                  </span>
                  <button
                    type="button"
                    onClick={() => void generateAiReflection(true)}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/18 hover:bg-white/28 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                    {aiLoading ? 'Đang soạn...' : 'Gợi ý suy niệm mới'}
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-3 text-sm sm:text-[15px] text-stone-700 leading-relaxed font-serif">
                    {activeAiReflection ? (
                      <p>{activeAiReflection.reflectionSummary}</p>
                    ) : (
                      liturgy.gospelReflection.paragraphs.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))
                    )}
                  </div>
                  <div className="bg-[var(--liturgy-tint)] border border-stone-200/80 rounded-xl p-4 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]">
                      Lời Nguyện Gợi Ý Sau Suy Niệm
                    </p>
                    <p className="font-serif italic text-sm text-stone-800 leading-relaxed">
                      “{activeAiReflection?.prayerPrompt || liturgy.gospelReflection.prayerPrompt}”
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-2.5">
                  <label
                    htmlFor="gospel-reflection-note"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]"
                  >
                    Ghi Chú Suy Niệm Tin Mừng Cá Nhân
                  </label>
                  <p className="text-xs text-stone-500">
                    Chúa Giêsu đang nói điều gì với lòng bạn qua đoạn Tin Mừng hôm nay?
                  </p>
                  <textarea
                    id="gospel-reflection-note"
                    rows={6}
                    value={entry.gospelReflectionNote || ''}
                    onChange={(e) =>
                      onUpdateEntry({
                        ...entry,
                        gospelReflectionNote: e.target.value,
                      })
                    }
                    placeholder="Viết vài dòng suy niệm Tin Mừng riêng tư của bạn (tự động lưu & mã hóa theo Gmail)..."
                    className="w-full px-3.5 py-3 text-sm neu-inset rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--liturgy-primary)] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 neu-surface rounded-2xl p-6 sm:p-8 space-y-8">
                <div className="neu-inset rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
                  <div className="space-y-0.5">
                    <p className="flex items-center gap-1.5 font-semibold text-stone-900">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--liturgy-primary)]" />
                      <span>
                        {activeQuestions.length} câu hỏi phản tỉnh sát với Tin Mừng: {liturgy.gospel.title}
                      </span>
                    </p>
                    {aiLoading && (
                      <p className="text-[11px] text-[var(--liturgy-primary)]">
                        AI đang đọc đoạn Tin Mừng ngày {liturgy.solarDateLabel} để tạo bộ câu hỏi phản tỉnh riêng cho hôm nay...
                      </p>
                    )}
                    {aiError && !aiLoading && (
                      <p className="text-[11px] text-amber-800">
                        Đang dùng câu hỏi gợi ý sẵn có ({aiError}).{' '}
                        <button
                          type="button"
                          onClick={() => void generateAiReflection(true)}
                          className="underline font-medium cursor-pointer"
                        >
                          Thử gọi AI lại
                        </button>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono text-stone-500">{liturgy.gospel.citation}</span>
                    <button
                      type="button"
                      onClick={() => void generateAiReflection(true)}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white border border-stone-300 rounded-lg text-stone-700 hover:border-[var(--liturgy-primary)] hover:text-[var(--liturgy-primary)] cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
                      Đổi câu hỏi AI
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {activeQuestions.map((question, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <label
                        htmlFor={`examen-q-${idx}`}
                        className="block font-serif text-base sm:text-lg font-medium text-stone-900 leading-snug"
                      >
                        <span className="font-mono text-xs text-[var(--liturgy-primary)] mr-2">0{idx + 1}.</span>
                        {question}
                      </label>
                      <textarea
                        id={`examen-q-${idx}`}
                        rows={3}
                        value={entry.examenResponses[idx] || ''}
                        onChange={(e) =>
                          onUpdateEntry({
                            ...entry,
                            examenResponses: {
                              ...entry.examenResponses,
                              [idx]: e.target.value,
                            },
                          })
                        }
                        placeholder="Viết tâm tình hồi tâm của bạn trước mặt Chúa..."
                        className="w-full px-3.5 py-2.5 text-sm neu-inset rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--liturgy-primary)]"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-stone-200/80 space-y-3">
                  <label
                    htmlFor="free-journal-note"
                    className="block font-serif text-xl font-medium text-stone-900"
                  >
                    Nhật Ký Ngày Sống Riêng Tư
                  </label>
                  <p className="text-xs text-stone-500">
                    Ghi lại những ơn lành nhận được hôm nay, những điều cần tạ ơn, xin lỗi hoặc phó dâng cho ngày mai.
                  </p>
                  <textarea
                    id="free-journal-note"
                    rows={6}
                    value={entry.journalNote}
                    onChange={(e) =>
                      onUpdateEntry({
                        ...entry,
                        journalNote: e.target.value,
                      })
                    }
                    placeholder="Lạy Chúa, hôm nay con xin dâng lên Ngài..."
                    className="w-full px-4 py-3 font-serif text-base neu-inset rounded-xl text-stone-900 leading-relaxed placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--liturgy-primary)]"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-stone-500">
                      {activeAccount
                        ? `Mã hóa AES-256-GCM riêng cho ${activeAccount.email}`
                        : 'Lưu tự động cục bộ · Chỉ hiển thị trên trình duyệt này'}
                    </span>
                    <button
                      type="button"
                      onClick={triggerSaveNotice}
                      className="px-4 py-2 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      style={{ background: 'var(--liturgy-gradient)' }}
                    >
                      Lưu trang Hồi tâm
                    </button>
                  </div>
                </div>
              </div>

              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-stone-900 border-b border-stone-200 pb-3">
                    <History className="w-4 h-4 text-[var(--liturgy-primary)]" />
                    <h3 className="font-serif text-lg font-medium">
                      Nhật Ký Những Ngày Trước
                    </h3>
                  </div>

                  {pastJournalEntries.length === 0 ? (
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Khi bạn viết Suy niệm Tin Mừng, Hồi tâm hoặc Quyết tâm qua các ngày, sổ nhật ký sẽ tự động lưu lại theo từng ngày tại đây để bạn nhìn lại hành trình thiêng liêng của mình.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
                      {pastJournalEntries.map((past) => {
                        const d = parseDateKey(past.dateKey);
                        return (
                          <button
                            key={past.dateKey}
                            type="button"
                            onClick={() => onSelectDate(past.dateKey)}
                            className="w-full text-left p-3.5 bg-[#FAF8F4] border border-stone-200 rounded-lg space-y-1 hover:border-[var(--liturgy-primary)]/40 transition-colors cursor-pointer"
                          >
                            <p className="text-xs font-mono text-[var(--liturgy-primary)]">
                              {d.toLocaleDateString('vi-VN')}
                            </p>
                            {past.chosenQuote && (
                              <p className="text-xs font-serif italic text-stone-700 line-clamp-1">
                                “{past.chosenQuote.text}”
                              </p>
                            )}
                            {past.gospelReflectionNote && (
                              <p className="text-xs text-stone-700 line-clamp-1">
                                Suy niệm: {past.gospelReflectionNote}
                              </p>
                            )}
                            {past.resolutionText && (
                              <p className="text-xs text-stone-600 line-clamp-1">
                                Quyết tâm: {past.resolutionText}
                              </p>
                            )}
                            {past.journalNote && (
                              <p className="text-xs text-stone-500 line-clamp-2">
                                {past.journalNote}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* 5 Bước Hồi Tâm Cổ Truyền — 5 Columns */}
        <div className="space-y-3 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--liturgy-primary)]">
            5 Bước Hồi Tâm Cổ Truyền
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 bg-white border border-stone-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
            {[
              { step: '01', title: 'Tri ân', desc: 'Nhớ lại những hồng ân nhỏ bé Chúa ban hôm nay.' },
              { step: '02', title: 'Xin ơn soi sáng', desc: 'Xin Chúa Thánh Thần soi chiếu lòng mình.' },
              { step: '03', title: 'Nhìn lại ngày sống', desc: 'Soi lại lời nói, việc làm qua Tin Mừng.' },
              { step: '04', title: 'Xin tha thứ', desc: 'Khiêm tốn xin Chúa thứ tha những thiếu sót.' },
              { step: '05', title: 'Hướng về ngày mai', desc: 'Phó dâng và canh tân quyết tâm.' },
            ].map((item) => (
              <div key={item.step} className="p-4 space-y-1.5">
                <span className="font-mono text-xs font-semibold text-[var(--liturgy-primary)]">
                  Bước {item.step}
                </span>
                <h3 className="font-serif text-base font-semibold text-stone-900">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glassmorphic PIN Modal */}
      {showPinSetupModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-modal-title"
        >
          <div className="glass-panel bg-[#FBF9F5]/95 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <h3 id="pin-modal-title" className="font-serif text-2xl font-medium text-stone-900">
              {pinConfigured ? 'Quản lý mã khóa Nhật ký' : 'Đặt mã khóa Nhật ký Hồi tâm'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Mã khóa 4–6 chữ số giúp bảo vệ trang Hồi tâm trên trình duyệt này, tránh việc người khác mở máy đọc lén tâm sự của bạn.
            </p>

            <form onSubmit={handleSetupPin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Mã PIN mới (4–6 chữ số)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono neu-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
                  placeholder="Ví dụ: 1234"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Nhập lại mã PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono neu-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
                  placeholder="Nhập lại mã PIN"
                />
              </div>

              {pinSetupError && <p className="text-xs text-[#8B261D]">{pinSetupError}</p>}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium bg-[#8B261D] text-white rounded-lg hover:bg-[#6E1D15] cursor-pointer"
                  >
                    Lưu mã khóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPinSetupModal(false)}
                    className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                {pinConfigured && (
                  <button
                    type="button"
                    onClick={handleRemovePin}
                    className="text-xs font-medium text-[#8B261D] hover:underline cursor-pointer"
                  >
                    Tắt mã khóa
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
