import type { PageId } from '../types/catholic';
import { HANOI_SACRED_MUSIC_URL } from '../data/hanoiSacredMusic';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white mt-12">
      <div
        aria-hidden="true"
        className="h-[3px] w-full"
        style={{ background: 'var(--liturgy-gradient)' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 space-y-2.5">
            <p className="font-serif text-xl font-bold text-[var(--liturgy-primary)]">
              Hiệp Thông · Vaticano Tiếng Việt
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
              Trang đồng hành phụng vụ, tin tức Giáo Hội, Lời Chúa hằng ngày, gợi ý Thánh nhạc TGP Hà Nội và nhật ký hồi tâm riêng tư dành cho người Công giáo Việt Nam.
            </p>
          </div>

          <div className="md:col-span-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200 pb-2">
              Chuyên mục chính
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-stone-700">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-left hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <button
                type="button"
                onClick={() => onNavigate('news')}
                className="text-left hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
              >
                Tin tức Giáo Hội
              </button>
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="text-left hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
              >
                Lịch Công Giáo
              </button>
              <button
                type="button"
                onClick={() => onNavigate('liturgy')}
                className="text-left hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
              >
                Phụng vụ
              </button>
              <button
                type="button"
                onClick={() => onNavigate('daily')}
                className="text-left hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
              >
                Ngày sống &amp; Hồi tâm
              </button>
              <button
                type="button"
                onClick={() => onNavigate('word')}
                className="text-left hover:text-[var(--liturgy-primary)] transition-colors cursor-pointer"
              >
                Lời Chúa
              </button>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200 pb-2">
              Nguồn tham chiếu
            </p>
            <div className="grid grid-cols-1 gap-2.5 text-xs text-stone-600">
              <a
                href="https://hdgmvietnam.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--liturgy-primary)] transition-colors"
              >
                Hội Đồng Giám Mục Việt Nam
              </a>
              <a
                href={HANOI_SACRED_MUSIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--liturgy-primary)] transition-colors"
              >
                Ủy ban Thánh nhạc TGP Hà Nội
              </a>
              <a
                href="https://www.vaticannews.va/vi.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--liturgy-primary)] transition-colors"
              >
                Vaticano Tiếng Việt
              </a>
              <a
                href="https://www.vaticannews.va/en.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--liturgy-primary)] transition-colors"
              >
                Vatican News (Roma)
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Sohoitam.org · Hiệp Thông · Ad Maiorem Dei Gloriam.</p>
          <p>Dữ liệu Ngày sống &amp; Hồi tâm được mã hóa và lưu giữ riêng tư trên thiết bị của bạn.</p>
        </div>
      </div>
    </footer>
  );
}
