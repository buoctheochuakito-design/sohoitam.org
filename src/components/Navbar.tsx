import { useState } from 'react';
import { Lock, Menu, ShieldCheck, User, X } from 'lucide-react';
import type { GmailAccountMeta, PageId } from '../types/catholic';

interface NavbarProps {
  activeNavKey: string;
  activeAccount: GmailAccountMeta | null;
  isVaultUnlocked: boolean;
  onNavigate: (page: PageId, scrollToExamen?: boolean) => void;
  onOpenAuth: () => void;
}

const NAV_ITEMS: { key: string; page: PageId; label: string; scrollToExamen?: boolean }[] = [
  { key: 'home', page: 'home', label: 'Trang chủ' },
  { key: 'news', page: 'news', label: 'Tin tức Giáo Hội' },
  { key: 'calendar', page: 'calendar', label: 'Lịch Công Giáo' },
  { key: 'liturgy', page: 'liturgy', label: 'Phụng vụ' },
  { key: 'daily', page: 'daily', label: 'Ngày sống' },
  { key: 'examen', page: 'daily', label: 'Hồi tâm', scrollToExamen: true },
  { key: 'word', page: 'word', label: 'Lời Chúa' },
];

export default function Navbar({
  activeNavKey,
  activeAccount,
  isVaultUnlocked,
  onNavigate,
  onOpenAuth,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (page: PageId, scrollToExamen = false) => {
    onNavigate(page, scrollToExamen);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div
        aria-hidden="true"
        className="h-[3px] w-full"
        style={{ background: 'var(--liturgy-gradient)' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="font-serif text-2xl font-bold tracking-tight text-[var(--liturgy-primary)] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--liturgy-primary)] rounded"
        >
          Hiệp Thông
        </button>

        {/* Single Top Row */}
        <nav className="hidden lg:flex items-center gap-5" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNavKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item.page, item.scrollToExamen)}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--liturgy-primary)] rounded ${
                  isActive
                    ? 'text-[var(--liturgy-primary)] font-semibold'
                    : 'text-stone-700 hover:text-[var(--liturgy-primary)]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-[2px]"
                    style={{ background: 'var(--liturgy-gradient)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action: Gmail Login / Account Status + Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAuth}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeAccount
                ? 'bg-[#FAF8F4] border border-stone-300 text-stone-800 hover:border-[var(--liturgy-primary)] hover:text-[var(--liturgy-primary)]'
                : 'text-white hover:opacity-90'
            }`}
            style={activeAccount ? undefined : { background: 'var(--liturgy-gradient)' }}
            title={activeAccount ? `Tài khoản: ${activeAccount.email}` : 'Đăng nhập bằng Gmail'}
          >
            {activeAccount ? (
              isVaultUnlocked ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F5E3B]" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[var(--liturgy-primary)]" />
              )
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
            <span className="max-w-[140px] truncate">
              {activeAccount ? activeAccount.email : 'Đăng nhập'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-[#1B365D] hover:text-[var(--liturgy-primary)] neu-surface-sm bg-[#ffffff]! rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--liturgy-primary)]"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNavKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item.page, item.scrollToExamen)}
                className={`w-full text-left px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--liturgy-tint)] text-[var(--liturgy-primary)] font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 mt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-white rounded-lg cursor-pointer"
              style={{ background: 'var(--liturgy-gradient)' }}
            >
              <User className="w-3.5 h-3.5" />
              {activeAccount ? activeAccount.email : 'Đăng nhập bằng Gmail'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
