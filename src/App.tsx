import type { CSSProperties } from 'react';
import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import CalendarPage from './components/CalendarPage';
import NewsPage from './components/NewsPage';
import LiturgyMusicPage from './components/LiturgyMusicPage';
import WordOfGodPage from './components/WordOfGodPage';
import DailyLivingPage from './components/DailyLivingPage';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { formatDateKey, getLiturgicalDay, getLiturgicalTheme } from './data/liturgy';
import { FALLBACK_CHURCH_NEWS } from './data/newsFallback';
import {
  createEmptyEntry,
  findGmailAccount,
  getActiveGmailEmail,
  loadAllEntries,
  loadEntryForDate,
  saveEncryptedVault,
  saveEntryForDate,
  setActiveGmailEmail,
} from './utils/journalStorage';
import type {
  DailyLivingEntry,
  GmailAccountMeta,
  NewsArticle,
  PageId,
} from './types/catholic';

export default function App() {
  const todayDateKey = formatDateKey(new Date());
  const [activePage, setActivePage] = useState<PageId>('home');
  const [activeNavKey, setActiveNavKey] = useState<string>('home');
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayDateKey);
  const [scrollToExamenSignal, setScrollToExamenSignal] = useState<number>(0);

  // Per-Gmail Encrypted Account State
  const [activeAccount, setActiveAccount] = useState<GmailAccountMeta | null>(() => {
    const email = getActiveGmailEmail();
    return email ? findGmailAccount(email) : null;
  });
  const [activeAesKey, setActiveAesKey] = useState<CryptoKey | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Daily living entries state (isolated per Gmail when signed in, or guest storage when signed out)
  const [allEntries, setAllEntries] = useState<Record<string, DailyLivingEntry>>(() => {
    const email = getActiveGmailEmail();
    if (email && findGmailAccount(email)) {
      return {}; // Decrypted once user enters password to derive AES-GCM key
    }
    return loadAllEntries();
  });

  const isVaultUnlocked = !activeAccount || Boolean(activeAesKey);

  // Church News state
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(FALLBACK_CHURCH_NEWS);
  const [newsLoading, setNewsLoading] = useState<boolean>(true);
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setNewsLoading(true);
    try {
      const response = await fetch(`/api/news${forceRefresh ? '?refresh=1' : ''}`);
      if (!response.ok) throw new Error('News API error');
      const data = (await response.json()) as {
        items?: NewsArticle[];
        liveSources?: string[];
        fetchedAt?: string;
      };

      const liveItems = Array.isArray(data.items) ? data.items : [];
      if (liveItems.length > 0) {
        const presentGroups = new Set(liveItems.map((item) => item.newsGroup));
        const supplemental = FALLBACK_CHURCH_NEWS.filter(
          (item) => !presentGroups.has(item.newsGroup)
        );
        setNewsArticles([...liveItems, ...supplemental]);
        setIsLiveFeed(true);
      } else {
        setNewsArticles(FALLBACK_CHURCH_NEWS);
        setIsLiveFeed(false);
      }
      setLastFetchedAt(data.fetchedAt || new Date().toISOString());
    } catch {
      setNewsArticles(FALLBACK_CHURCH_NEWS);
      setIsLiveFeed(false);
      setLastFetchedAt(new Date().toISOString());
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(false);
  }, [fetchNews]);

  const handleNavigate = (page: PageId, scrollToExamen = false) => {
    setActivePage(page);
    setActiveNavKey(page === 'daily' && scrollToExamen ? 'examen' : page);
    if (scrollToExamen) {
      setScrollToExamenSignal((prev) => prev + 1);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const todayLiturgy = getLiturgicalDay(todayDateKey);
  const selectedLiturgy = getLiturgicalDay(selectedDateKey);

  const todayEntry = activeAccount
    ? allEntries[todayDateKey] || createEmptyEntry(todayDateKey)
    : allEntries[todayDateKey] || loadEntryForDate(todayDateKey);

  const selectedEntry = activeAccount
    ? allEntries[selectedDateKey] || createEmptyEntry(selectedDateKey)
    : allEntries[selectedDateKey] || loadEntryForDate(selectedDateKey);

  const handleUpdateEntry = (updated: DailyLivingEntry) => {
    if (activeAccount) {
      if (!activeAesKey) {
        setAuthModalOpen(true);
        return;
      }
      const nextAll = {
        ...allEntries,
        [updated.dateKey]: {
          ...updated,
          updatedAt: new Date().toISOString(),
        },
      };
      setAllEntries(nextAll);
      void saveEncryptedVault(activeAccount.emailHash, nextAll, activeAesKey);
      return;
    }

    const nextAll = saveEntryForDate(updated);
    setAllEntries(nextAll);
  };

  const handlePickQuoteForSelectedDay = (quote: {
    text: string;
    sourceLabel: string;
    reference: string;
  }) => {
    const current = selectedEntry;
    handleUpdateEntry({
      ...current,
      chosenQuote: quote,
    });
  };

  const handleAuthSuccess = (payload: {
    account: GmailAccountMeta;
    aesKey: CryptoKey;
    entries: Record<string, DailyLivingEntry>;
  }) => {
    setActiveAccount(payload.account);
    setActiveAesKey(payload.aesKey);
    setAllEntries(payload.entries);
  };

  const handleLockVault = () => {
    setActiveAesKey(null);
    setAllEntries({});
  };

  const handleLogout = () => {
    setActiveGmailEmail(null);
    setActiveAccount(null);
    setActiveAesKey(null);
    setAllEntries(loadAllEntries());
  };

  const themeLiturgy =
    activePage === 'home' || activePage === 'news' ? todayLiturgy : selectedLiturgy;
  const themePalette = getLiturgicalTheme(themeLiturgy.color);
  const rootThemeStyle = {
    '--liturgy-primary': themePalette.primary,
    '--liturgy-primary-hover': themePalette.primaryHover,
    '--liturgy-secondary': themePalette.secondary,
    '--liturgy-gradient': themePalette.gradient,
    '--liturgy-canvas-gradient': themePalette.canvasGradient,
    '--liturgy-tint': themePalette.tintBg,
    '--liturgy-border-tint': themePalette.borderTint,
    background: themePalette.canvasGradient,
  } as CSSProperties;

  return (
    <div
      className="min-h-screen flex flex-col text-[#1C1917] transition-colors duration-300"
      style={rootThemeStyle}
    >
      <Navbar
        activeNavKey={activeNavKey}
        activeAccount={activeAccount}
        isVaultUnlocked={isVaultUnlocked}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            todayLiturgy={todayLiturgy}
            todayEntry={todayEntry}
            latestNews={newsArticles}
            onUpdateTodayEntry={handleUpdateEntry}
            onNavigate={handleNavigate}
            onSelectDateAndGo={(dateKey, page) => {
              setSelectedDateKey(dateKey);
              handleNavigate(page);
            }}
          />
        )}

        {activePage === 'calendar' && (
          <CalendarPage
            selectedDateKey={selectedDateKey}
            todayDateKey={todayDateKey}
            onSelectDate={(dateKey) => setSelectedDateKey(dateKey)}
            onGoToWordOfGod={(dateKey) => {
              setSelectedDateKey(dateKey);
              handleNavigate('word');
            }}
          />
        )}

        {activePage === 'news' && (
          <NewsPage
            articles={newsArticles}
            loading={newsLoading}
            isLiveFeed={isLiveFeed}
            lastFetchedAt={lastFetchedAt}
            onRefresh={() => fetchNews(true)}
          />
        )}

        {activePage === 'liturgy' && (
          <LiturgyMusicPage
            liturgy={selectedLiturgy}
            todayDateKey={todayDateKey}
            onChangeDate={(dateKey) => setSelectedDateKey(dateKey)}
            onOpenWordOfGod={() => handleNavigate('word')}
          />
        )}

        {activePage === 'word' && (
          <WordOfGodPage
            liturgy={selectedLiturgy}
            entry={selectedEntry}
            todayDateKey={todayDateKey}
            onChangeDate={(dateKey) => setSelectedDateKey(dateKey)}
            onPickQuote={handlePickQuoteForSelectedDay}
            onOpenCalendar={() => handleNavigate('calendar')}
            onOpenDailyLiving={() => handleNavigate('daily')}
            onOpenLiturgyMusic={() => handleNavigate('liturgy')}
          />
        )}

        {activePage === 'daily' && (
          <DailyLivingPage
            liturgy={selectedLiturgy}
            entry={selectedEntry}
            allEntries={allEntries}
            scrollToExamenSignal={scrollToExamenSignal}
            activeAccount={activeAccount}
            isVaultUnlocked={isVaultUnlocked}
            onOpenAuth={() => setAuthModalOpen(true)}
            onAuthSuccess={handleAuthSuccess}
            onLockVault={handleLockVault}
            onLogout={handleLogout}
            onUpdateEntry={handleUpdateEntry}
            onSelectDate={(dateKey) => setSelectedDateKey(dateKey)}
          />
        )}
      </main>

      <Footer onNavigate={(page) => handleNavigate(page)} />

      <AuthModal
        isOpen={authModalOpen}
        activeAccount={activeAccount}
        isVaultUnlocked={isVaultUnlocked}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onLockVault={handleLockVault}
        onLogout={handleLogout}
      />
    </div>
  );
}
