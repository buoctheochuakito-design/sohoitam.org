import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, LogOut, Mail, ShieldCheck, UserPlus, X } from 'lucide-react';
import type { DailyLivingEntry, GmailAccountMeta } from '../types/catholic';
import {
  listGmailAccounts,
  loginGmailAccount,
  registerGmailAccount,
} from '../utils/journalStorage';

interface AuthModalProps {
  isOpen: boolean;
  activeAccount: GmailAccountMeta | null;
  isVaultUnlocked: boolean;
  onClose: () => void;
  onAuthSuccess: (payload: {
    account: GmailAccountMeta;
    aesKey: CryptoKey;
    entries: Record<string, DailyLivingEntry>;
  }) => void;
  onLockVault: () => void;
  onLogout: () => void;
}

export default function AuthModal({
  isOpen,
  activeAccount,
  isVaultUnlocked,
  onClose,
  onAuthSuccess,
  onLockVault,
  onLogout,
}: AuthModalProps) {
  const existingAccounts = listGmailAccounts();
  const [mode, setMode] = useState<'login' | 'register'>(() =>
    activeAccount ? 'login' : existingAccounts.length > 0 ? 'login' : 'register'
  );
  const [email, setEmail] = useState(() => activeAccount?.email || '');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Hai lần nhập mật khẩu chưa khớp.');
        }
        const res = await registerGmailAccount(email, password, displayName);
        onAuthSuccess(res);
        setPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        const res = await loginGmailAccount(email, password);
        onAuthSuccess(res);
        setPassword('');
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xác thực tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Top Crimson Header */}
        <div className="px-6 py-4 bg-white border-b border-stone-200 border-t-2 border-t-[#8B261D] flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8B261D]">
              Tài Khoản Hồi Tâm Riêng Tư
            </p>
            <h2 id="auth-modal-title" className="font-serif text-xl font-bold text-stone-900">
              {activeAccount && isVaultUnlocked
                ? 'Tài khoản Gmail đang hoạt động'
                : mode === 'login'
                ? 'Đăng nhập bằng Gmail'
                : 'Tạo tài khoản Gmail mới'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-stone-900 cursor-pointer"
            aria-label="Đóng cửa sổ đăng nhập"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Signed-in & Unlocked Summary */}
          {activeAccount && isVaultUnlocked ? (
            <div className="space-y-5">
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#8B261D]/10 text-[#8B261D] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {activeAccount.displayName}
                    </p>
                    <p className="text-xs font-mono text-stone-500 truncate">
                      {activeAccount.email}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pt-1 border-t border-stone-100">
                  Mọi ghi chép Hồi tâm và Quyết tâm của bạn đang được mã hóa riêng bằng khóa AES-256-GCM gắn với địa chỉ Gmail này.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onLockVault();
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white border border-stone-300 text-stone-800 hover:border-[#8B261D] hover:text-[#8B261D] rounded-lg cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Khóa nhanh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setEmail('');
                    setPassword('');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-[#8B261D] hover:bg-[#6E1D15] text-white rounded-lg cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Tabs */}
              <div className="grid grid-cols-2 p-1 bg-[#ECE6DA] border border-stone-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-[#8B261D] font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Đăng nhập Gmail
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-[#8B261D] font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tạo tài khoản mới
                </button>
              </div>

              {/* Saved Gmail accounts quick selector when logging in */}
              {mode === 'login' && existingAccounts.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-stone-500">
                    Tài khoản Gmail đã tạo trên máy này:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {existingAccounts.map((acc) => (
                      <button
                        key={acc.emailHash}
                        type="button"
                        onClick={() => {
                          setEmail(acc.email);
                          setError('');
                        }}
                        className={`text-left px-3 py-2 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          email.trim().toLowerCase() === acc.email
                            ? 'bg-white border-[#8B261D] text-[#8B261D] font-medium'
                            : 'bg-white/70 border-stone-200 text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <span className="truncate font-mono">{acc.email}</span>
                        <span className="text-[11px] text-stone-400 shrink-0">{acc.displayName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="auth-gmail" className="block text-xs font-medium text-stone-700">
                    Địa chỉ Gmail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-gmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenban@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label htmlFor="auth-name" className="block text-xs font-medium text-stone-700">
                      Tên Thánh / Tên hiển thị (tùy chọn)
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ví dụ: Giuse Tuấn Anh"
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="auth-pass" className="block text-xs font-medium text-stone-700">
                    Mật khẩu mã hóa (tối thiểu 6 ký tự)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu bảo mật..."
                      className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label htmlFor="auth-confirm" className="block text-xs font-medium text-stone-700">
                      Nhập lại mật khẩu
                    </label>
                    <input
                      id="auth-confirm"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu..."
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-xs text-[#8B261D] bg-[#8B261D]/10 border border-[#8B261D]/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Mỗi địa chỉ Gmail có kho lưu trữ tách biệt và được mã hóa AES-256-GCM trực tiếp từ mật khẩu của bạn.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium bg-[#8B261D] hover:bg-[#6E1D15] text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  {mode === 'register' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      {submitting ? 'Đang khởi tạo kho mã hóa...' : 'Tạo tài khoản & Mở Hồi tâm'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {submitting ? 'Đang giải mã...' : 'Đăng nhập & Giải mã Hồi tâm'}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
