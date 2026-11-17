import { useState } from 'react';
import { ArrowRight, ExternalLink, RefreshCw, Search, X } from 'lucide-react';
import type { NewsArticle } from '../types/catholic';
import { NEWS_GROUP_META } from '../utils/newsCategories';

interface NewsPageProps {
  articles: NewsArticle[];
  loading: boolean;
  isLiveFeed: boolean;
  lastFetchedAt: string | null;
  onRefresh: () => void;
}

type GroupFilter = 'all' | 'vatican' | 'vietnam' | 'world';

export default function NewsPage({
  articles,
  loading,
  isLiveFeed,
  lastFetchedAt,
  onRefresh,
}: NewsPageProps) {
  const [filter, setFilter] = useState<GroupFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const filteredArticles = articles.filter((item) => {
    const matchesGroup = filter === 'all' || item.newsGroup === filter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.sourceLabel.toLowerCase().includes(q);
    return matchesGroup && matchesSearch;
  });

  const leadArticle = filteredArticles[0] || null;
  const secondaryArticles = filteredArticles.slice(1, 7);
  const wireArticles = filteredArticles.slice(7);

  const vaticanCol = filteredArticles.filter((a) => a.newsGroup === 'vatican');
  const vietnamCol = filteredArticles.filter((a) => a.newsGroup === 'vietnam');
  const worldCol = filteredArticles.filter((a) => a.newsGroup === 'world');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Category Filter Tabs, Search & Refresh in one clean bar */}
      <div className="border-b border-stone-200 pb-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs tracking-wider uppercase text-[var(--liturgy-primary)] font-semibold">
              Cổng Tin Tức Giáo Hội
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 leading-tight text-balance">
              Tin Tức Giáo Hội: Vatican, Việt Nam &amp; Thế Giới
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
            <span>
              {isLiveFeed ? 'Nguồn RSS trực tuyến' : 'Bản tin tổng hợp tiêu biểu'}
            </span>
            {lastFetchedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono">
                  Cập nhật: {new Date(lastFetchedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-stone-700 hover:border-[#8B261D] hover:text-[#8B261D] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#ECE6DA] border border-stone-200 rounded-lg w-fit">
            {[
              { id: 'all' as GroupFilter, label: 'Tất cả chuyên mục' },
              { id: 'vatican' as GroupFilter, label: 'Vatican' },
              { id: 'vietnam' as GroupFilter, label: 'Giáo Hội Việt Nam' },
              { id: 'world' as GroupFilter, label: 'Thế giới' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-white text-[var(--liturgy-primary)] shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tin tức Giáo Hội..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-stone-300 rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B261D]"
            />
          </div>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading && articles.length === 0 ? (
        <div className="py-16 text-center text-sm text-stone-500 bg-white border border-stone-200 rounded-xl">
          Đang tải bản tin từ Giáo Hội Việt Nam và Vatican News...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white border border-stone-200 rounded-xl">
          <p className="font-serif text-lg text-stone-900">Không tìm thấy bản tin phù hợp</p>
          <p className="text-sm text-stone-500">Thử thay đổi chuyên mục hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Tier 1: Lead Story Card */}
          {leadArticle && (
            <article className="bg-white border border-stone-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-6 bg-stone-200 min-h-[260px] lg:min-h-[340px]">
                <img
                  src={leadArticle.imageUrl || '/src/assets/images/news_vatican_square_1794840222803.jpg'}
                  alt={leadArticle.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/images/news_vatican_square_1794840222803.jpg';
                  }}
                  className="w-full h-full object-cover lg:h-full"
                />
              </div>

              <div className="lg:col-span-6 p-6 sm:p-9 flex flex-col justify-between space-y-5 border-t lg:border-t-0 lg:border-l border-stone-200">
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 border-b border-stone-200 pb-3">
                    <span
                      className="font-semibold uppercase tracking-wider"
                      style={{ color: NEWS_GROUP_META[leadArticle.newsGroup].dotColor }}
                    >
                      {NEWS_GROUP_META[leadArticle.newsGroup].label}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{leadArticle.sourceLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-mono">
                      {new Date(leadArticle.publishedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                    {leadArticle.title}
                  </h2>

                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    {leadArticle.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(leadArticle)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#FBF9F5] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ background: 'var(--liturgy-gradient)' }}
                  >
                    Xem thêm chi tiết
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={leadArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B365D] hover:text-[#8B261D]"
                  >
                    Mở bài gốc tại nguồn
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          )}

          {/* Tier 2: 3-Column Broadsheet Section View (when showing All) OR Filtered Multi-Column Grid */}
          {filter === 'all' && !searchQuery.trim() ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { id: 'vatican' as GroupFilter, label: 'Tin Vatican', accent: '#8B261D', items: vaticanCol },
                { id: 'vietnam' as GroupFilter, label: 'Giáo Hội Việt Nam', accent: '#1B365D', items: vietnamCol },
                { id: 'world' as GroupFilter, label: 'Thế giới', accent: '#1F5E3B', items: worldCol },
              ].map((col) => (
                <div
                  key={col.label}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between"
                  style={{ borderTopWidth: '3px', borderTopColor: col.accent }}
                >
                  <div>
                    <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-stone-200 flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold" style={{ color: col.accent }}>
                        {col.label}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setFilter(col.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[#8B261D] cursor-pointer"
                      >
                        Xem thêm
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="divide-y divide-stone-200">
                      {col.items.map((article) => (
                        <article
                          key={article.id}
                          className="p-5 space-y-2 hover:bg-[#FAF8F4]/70 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
                            <span className="font-semibold uppercase tracking-wide" style={{ color: col.accent }}>
                              {article.category}
                            </span>
                            <span className="tabular-nums font-mono">
                              {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <h4 className="font-serif text-base font-semibold text-stone-900 leading-snug">
                            <button
                              type="button"
                              onClick={() => setSelectedArticle(article)}
                              className="text-left hover:text-[#8B261D] transition-colors cursor-pointer"
                            >
                              {article.title}
                            </button>
                          </h4>
                          <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <span className="text-stone-500 truncate pr-2">{article.sourceLabel}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedArticle(article)}
                              className="inline-flex items-center gap-1 font-semibold text-[#8B261D] hover:underline shrink-0 cursor-pointer"
                            >
                              Xem thêm
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            secondaryArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {secondaryArticles.map((article) => {
                  const meta = NEWS_GROUP_META[article.newsGroup];
                  return (
                    <article
                      key={article.id}
                      className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-[#8B261D]/40 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 border-b border-stone-200 pb-2.5">
                          <span className="font-semibold uppercase tracking-wide" style={{ color: meta.dotColor }}>
                            {meta.label} · {article.category}
                          </span>
                          <span className="tabular-nums font-mono shrink-0">
                            {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg sm:text-xl font-semibold text-stone-900 leading-snug">
                          <button
                            type="button"
                            onClick={() => setSelectedArticle(article)}
                            className="text-left hover:text-[#8B261D] transition-colors cursor-pointer"
                          >
                            {article.title}
                          </button>
                        </h3>

                        <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                        <span className="text-stone-500 truncate pr-2">{article.sourceLabel}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedArticle(article)}
                          className="inline-flex items-center gap-1 font-semibold text-[#8B261D] hover:underline shrink-0 cursor-pointer"
                        >
                          Xem thêm
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          )}

          {/* Tier 3: Compact Multi-Column Archive */}
          {wireArticles.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-200 pb-3">
                Bản tin Giáo Hội khác
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wireArticles.map((article) => {
                  const meta = NEWS_GROUP_META[article.newsGroup];
                  return (
                    <div
                      key={article.id}
                      className="bg-[#FAF8F4] border border-stone-200 rounded-lg p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold uppercase tracking-wide" style={{ color: meta.dotColor }}>
                            {meta.label}
                          </span>
                          <span className="tabular-nums font-mono text-stone-500">
                            {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedArticle(article)}
                          className="font-serif text-base font-medium text-stone-900 hover:text-[#8B261D] text-left cursor-pointer line-clamp-2"
                        >
                          {article.title}
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
                        <span className="text-stone-500 truncate pr-2">{article.sourceLabel}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedArticle(article)}
                          className="inline-flex items-center gap-1 font-semibold text-[#8B261D] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Xem thêm
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Official Portal Directory as 3 Columns */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <div className="space-y-1 border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                Cổng thông tin chính thức của Giáo Hội
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Truy cập trực tiếp các trang tin Công giáo uy tín tại Việt Nam và Tòa Thánh Roma.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
              <a
                href="https://hdgmvietnam.com"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 sm:py-1 sm:pr-4 flex items-center justify-between text-xs font-semibold text-[#1B365D] hover:text-[#8B261D]"
              >
                <span>Hội Đồng Giám Mục Việt Nam</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <a
                href="https://www.vaticannews.va/vi.html"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 sm:py-1 sm:px-4 flex items-center justify-between text-xs font-semibold text-[#8B261D] hover:underline"
              >
                <span>Vaticano Tiếng Việt</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <a
                href="https://www.vaticannews.va/en.html"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 sm:py-1 sm:pl-4 flex items-center justify-between text-xs font-semibold text-[#1F5E3B] hover:underline"
              >
                <span>Vatican News (Roma)</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="news-modal-title"
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
              id="news-modal-title"
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
