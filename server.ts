import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  source: 'vietnam' | 'vatican-vi' | 'vatican-en';
  newsGroup: 'vatican' | 'vietnam' | 'world';
  sourceLabel: string;
  category: string;
  imageUrl?: string;
  isLive: boolean;
}

interface CacheEntry {
  timestamp: number;
  items: NewsItem[];
  liveSources: string[];
}

const CACHE_TTL_MS = 15 * 60 * 1000;
let newsCache: CacheEntry | null = null;

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = block.match(regex);
  return match ? match[1].trim() : '';
}

function extractImageUrl(block: string): string | undefined {
  const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch) return enclosureMatch[1];

  const mediaMatch = block.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) return mediaMatch[1];

  const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  return undefined;
}

function parseRssItems(
  xml: string,
  source: 'vietnam' | 'vatican-vi' | 'vatican-en',
  sourceLabel: string,
  defaultCategory: string
): NewsItem[] {
  const items: NewsItem[] = [];
  const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];

  for (let i = 0; i < Math.min(itemMatches.length, 8); i++) {
    const block = itemMatches[i];
    const rawTitle = extractTag(block, 'title');
    const rawLink = extractTag(block, 'link');
    const rawDesc = extractTag(block, 'description') || extractTag(block, 'content:encoded');
    const rawDate = extractTag(block, 'pubDate') || extractTag(block, 'dc:date');
    const rawCategory = extractTag(block, 'category');

    const title = decodeHtmlEntities(rawTitle);
    const link = decodeHtmlEntities(rawLink);
    const summary = decodeHtmlEntities(rawDesc).slice(0, 260);
    const category = decodeHtmlEntities(rawCategory) || defaultCategory;

    if (!title || !link) continue;

    let publishedAt = new Date().toISOString();
    if (rawDate) {
      const parsed = Date.parse(rawDate);
      if (!Number.isNaN(parsed)) {
        publishedAt = new Date(parsed).toISOString();
      }
    }

    const newsGroup: 'vatican' | 'vietnam' | 'world' =
      source === 'vietnam'
        ? 'vietnam'
        : source === 'vatican-vi'
        ? 'vatican'
        : i % 2 === 0
        ? 'world'
        : 'vatican';

    items.push({
      id: `${source}-${i}-${Buffer.from(link).toString('base64').slice(0, 10)}`,
      title,
      summary: summary.length >= 258 ? `${summary}...` : summary,
      link,
      publishedAt,
      source,
      newsGroup,
      sourceLabel,
      category,
      imageUrl: extractImageUrl(block),
      isLive: true,
    });
  }

  return items;
}

async function fetchRssFeed(
  url: string,
  source: 'vietnam' | 'vatican-vi' | 'vatican-en',
  sourceLabel: string,
  defaultCategory: string
): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5500);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HiepThongCatholicPortal/1.0 (+https://vaticannews.va)',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml, source, sourceLabel, defaultCategory);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function getChurchNews(forceRefresh = false): Promise<CacheEntry> {
  if (!forceRefresh && newsCache && Date.now() - newsCache.timestamp < CACHE_TTL_MS) {
    return newsCache;
  }

  const [vaticanVi, vaticanEn, hdgmvn, tgpsg] = await Promise.all([
    fetchRssFeed('https://www.vaticannews.va/vi.rss.xml', 'vatican-vi', 'Vaticano Tiếng Việt', 'Tòa Thánh'),
    fetchRssFeed('https://www.vaticannews.va/en.rss.xml', 'vatican-en', 'Vatican News', 'Giáo Hội Hoàn Vũ'),
    fetchRssFeed('https://hdgmvietnam.com/feed', 'vietnam', 'Hội Đồng Giám Mục Việt Nam', 'Giáo Hội Việt Nam'),
    fetchRssFeed('https://tgpsaigon.net/feed', 'vietnam', 'Tổng Giáo Phận Sài Gòn', 'Giáo Hội Việt Nam'),
  ]);

  const vietnamItems = hdgmvn.length > 0 ? hdgmvn : tgpsg;
  const combined = [...vaticanVi, ...vietnamItems, ...vaticanEn].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );

  const liveSources: string[] = [];
  if (vaticanVi.length > 0) liveSources.push('vatican-vi');
  if (vaticanEn.length > 0) liveSources.push('vatican-en');
  if (vietnamItems.length > 0) liveSources.push('vietnam');

  newsCache = {
    timestamp: Date.now(),
    items: combined,
    liveSources,
  };
  return newsCache;
}

interface AiExamenResult {
  theme: string;
  reflectionSummary: string;
  prayerPrompt: string;
  questions: string[];
  generatedAt: string;
}

const aiExamenCache = new Map<string, AiExamenResult>();

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'hiep-thong',
      mode: isProd ? 'production' : 'development',
      appUrl: process.env.APP_URL || 'https://sohoitam.org',
    });
  });

  app.get('/api/news', async (req, res) => {
    const forceRefresh = req.query.refresh === '1';
    const data = await getChurchNews(forceRefresh);
    res.json({
      items: data.items,
      liveSources: data.liveSources,
      fetchedAt: new Date(data.timestamp).toISOString(),
    });
  });

  app.post('/api/ai/examen-reflection', async (req, res) => {
    try {
      const {
        dateKey,
        feastTitle,
        season,
        gospelCitation,
        gospelTitle,
        gospelVerses,
        forceRegenerate,
      } = (req.body || {}) as {
        dateKey?: string;
        feastTitle?: string;
        season?: string;
        gospelCitation?: string;
        gospelTitle?: string;
        gospelVerses?: string[];
        forceRegenerate?: boolean;
      };

      if (!gospelTitle || !Array.isArray(gospelVerses) || gospelVerses.length === 0) {
        res.status(400).json({ error: 'Thiếu nội dung Tin Mừng để tạo câu hỏi phản tỉnh.' });
        return;
      }

      const cacheKey = `${dateKey || 'today'}::${gospelCitation || gospelTitle}`;
      if (!forceRegenerate && aiExamenCache.has(cacheKey)) {
        res.json({ ...aiExamenCache.get(cacheKey), cached: true });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const client =
        aiClient ||
        (apiKey
          ? new GoogleGenAI({
              apiKey,
              httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
            })
          : null);

      if (!client) {
        res.status(503).json({
          error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ để tạo suy niệm AI.',
        });
        return;
      }

      const gospelText = gospelVerses.join('\n');
      const prompt = [
        `Ngày phụng vụ: ${dateKey || 'hôm nay'} — ${feastTitle || 'Ngày thường'} (${season || 'Mùa Thường Niên'}).`,
        `Bài Tin Mừng (${gospelCitation || ''}): ${gospelTitle}`,
        `Nội dung đoạn Tin Mừng:\n${gospelText}`,
        '',
        'Hãy giúp người tín hữu Công giáo Việt Nam thực hiện giờ Suy Niệm Tin Mừng và Hồi Tâm cuối ngày thật sâu sắc, cá nhân hóa và sát với từng chi tiết của bài Tin Mừng trên.',
        'Yêu cầu:',
        '1. "theme": Một tiêu đề suy niệm súc tích, giàu chất thiêng liêng (tối đa 14 từ).',
        '2. "reflectionSummary": Đoạn suy niệm ngắn (2–3 câu, khoảng 60–90 từ) nối kết trực tiếp hình ảnh/nhân vật/lời Chúa trong đoạn Tin Mừng hôm nay với đời sống thường nhật (gia đình, công việc, tương quan).',
        '3. "prayerPrompt": Một lời nguyện ngắn chân thành (1–2 câu) xưng hô "Lạy Chúa".',
        '4. "questions": Đúng 4 câu hỏi phản tỉnh / xét mình cá nhân bằng tiếng Việt trang trọng mà gần gũi ("bạn"), mỗi câu hỏi phải gắn chặt với một chi tiết cụ thể trong đoạn Tin Mừng hôm nay (ví dụ nếu là người mù Giêrikhô thì hỏi về "điểm mù đức tin cần Chúa chữa lành", "tiếng ồn cản trở lời kêu cầu", "câu trả lời cho câu hỏi Ngài muốn làm gì cho con", "bước đi theo Chúa sau khi được sáng mắt"). Không hỏi chung chung.',
      ].join('\n');

      const response = await client.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là vị linh hướng Công giáo Việt Nam sâu sắc, am hiểu Kinh Thánh và linh đạo Hồi tâm (Examen) của Thánh Inhã. Luôn trả lời bằng tiếng Việt chuẩn mực, ấm áp, tránh sáo rỗng, bám sát chi tiết Tin Mừng được cung cấp.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              theme: {
                type: Type.STRING,
                description: 'Tiêu đề ngắn gọn cho suy niệm Tin Mừng hôm nay.',
              },
              reflectionSummary: {
                type: Type.STRING,
                description: 'Đoạn suy niệm ngắn 2-3 câu nối kết Tin Mừng với đời sống thường nhật.',
              },
              prayerPrompt: {
                type: Type.STRING,
                description: 'Lời nguyện ngắn dâng lên Chúa sau khi suy niệm.',
              },
              questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách 3 đến 4 câu hỏi phản tỉnh sát với chi tiết bài Tin Mừng hôm nay.',
              },
            },
            required: ['theme', 'reflectionSummary', 'prayerPrompt', 'questions'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as {
        theme?: string;
        reflectionSummary?: string;
        prayerPrompt?: string;
        questions?: string[];
      };

      const cleanedQuestions = Array.isArray(parsed.questions)
        ? parsed.questions.map((q) => String(q).trim()).filter(Boolean).slice(0, 4)
        : [];

      if (cleanedQuestions.length < 3 || !parsed.reflectionSummary) {
        throw new Error('Phản hồi AI chưa đủ cấu trúc câu hỏi phản tỉnh.');
      }

      const result: AiExamenResult = {
        theme: (parsed.theme || gospelTitle).trim(),
        reflectionSummary: parsed.reflectionSummary.trim(),
        prayerPrompt: (parsed.prayerPrompt || 'Lạy Chúa, xin soi sáng tâm hồn con qua Lời Chúa hôm nay.').trim(),
        questions: cleanedQuestions,
        generatedAt: new Date().toISOString(),
      };

      aiExamenCache.set(cacheKey, result);
      res.json({ ...result, cached: false });
    } catch (error) {
      console.error('Gemini examen-reflection error:', error);
      const message =
        error instanceof Error ? error.message : 'Không thể tạo câu hỏi phản tỉnh từ AI lúc này.';
      res.status(500).json({ error: message });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        index: 'index.html',
        setHeaders: (res, filePath) => {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
          } else if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found. Run npm run build first.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Hiep Thong server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
