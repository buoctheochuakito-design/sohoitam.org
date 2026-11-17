import type { LiturgicalColor, LiturgicalSeason } from '../types/catholic';

export interface SacredHymnSuggestion {
  id: string;
  part: 'Ca nhập lễ' | 'Đáp ca / Tung hô' | 'Ca dâng lễ' | 'Ca hiệp lễ' | 'Ca kết lễ';
  title: string;
  composer: string;
  seasonGroup:
    | 'Mùa Thường Niên'
    | 'Mùa Vọng'
    | 'Mùa Giáng Sinh'
    | 'Mùa Chay'
    | 'Mùa Phục Sinh'
    | 'Đức Mẹ & Tử Đạo'
    | 'Lễ Cầu Hồn';
  liturgicalColor: LiturgicalColor;
  lyricsExcerpt: string;
  usageNote: string;
}

export const HANOI_SACRED_MUSIC_URL =
  'https://www.tonggiaophanhanoi.org/chuyen-muc/uy-ban-thanh-nhac/';

export const HANOI_SACRED_HYMNS: SacredHymnSuggestion[] = [
  // MÙA THƯỜNG NIÊN (Áo lễ Xanh lá)
  {
    id: 'tn-1',
    part: 'Ca nhập lễ',
    title: 'Bước Vào Đền Thánh',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Mùa Thường Niên',
    liturgicalColor: 'green',
    lyricsExcerpt: 'Con tiến bước lên bàn thờ Chúa, là nguồn vui của tuổi xuân con...',
    usageNote: 'Gợi ý hát đầu Thánh lễ các Chúa Nhật và ngày thường Mùa Thường Niên.',
  },
  {
    id: 'tn-2',
    part: 'Ca nhập lễ',
    title: 'Vào Đời Ca Ngợi',
    composer: 'Lm. Thành Tâm',
    seasonGroup: 'Mùa Thường Niên',
    liturgicalColor: 'green',
    lyricsExcerpt: 'Cùng hòa nhịp bước tiến về nhà Chúa, muôn tâm hồn dâng tiếng ca tạ ơn...',
    usageNote: 'Thích hợp cho cộng đoàn giáo xứ trong Thánh lễ Chúa Nhật Thường Niên.',
  },
  {
    id: 'tn-3',
    part: 'Đáp ca / Tung hô',
    title: 'Thánh Vịnh 23 — Chúa Chăn Nuôi Tôi',
    composer: 'Lm. Thái Nguyên',
    seasonGroup: 'Mùa Thường Niên',
    liturgicalColor: 'green',
    lyricsExcerpt: 'Chúa chăn nuôi tôi, tôi chẳng thiếu thốn chi, trên đồng cỏ xanh Người cho tôi nghỉ ngơi...',
    usageNote: 'Dùng theo bản nhạc Đáp ca của Ủy ban Thánh nhạc TGP Hà Nội.',
  },
  {
    id: 'tn-4',
    part: 'Ca dâng lễ',
    title: 'Của Lễ Ngày Sống',
    composer: 'Nguyễn Duy',
    seasonGroup: 'Mùa Thường Niên',
    liturgicalColor: 'green',
    lyricsExcerpt: 'Xin dâng lên Chúa tấm bánh thơm với chén rượu nồng, hòa cùng công việc sớm hôm...',
    usageNote: 'Hợp tâm tình dâng hiến lao động và đời sống thường nhật lên bàn thờ.',
  },
  {
    id: 'tn-5',
    part: 'Ca hiệp lễ',
    title: 'Ở Lại Trong Thầy',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Mùa Thường Niên',
    liturgicalColor: 'green',
    lyricsExcerpt: 'Hãy ở lại trong tình yêu của Thầy, như cành nho gắn liền với thân nho...',
    usageNote: 'Tâm tình kết hiệp sâu lắng khi rước Mình Máu Thánh Chúa.',
  },
  {
    id: 'tn-6',
    part: 'Ca kết lễ',
    title: 'Khúc Ca Tạ Ơn',
    composer: 'Phanxicô',
    seasonGroup: 'Mùa Thường Niên',
    liturgicalColor: 'green',
    lyricsExcerpt: 'Tạ ơn Chúa muôn đời vì tình thương Ngài, xin bước đi gieo rắc bình an...',
    usageNote: 'Sai đi sống Tin Mừng giữa môi trường gia đình và xã hội.',
  },

  // MÙA VỌNG (Áo lễ Tím)
  {
    id: 'mv-1',
    part: 'Ca nhập lễ',
    title: 'Trời Cao Hãy Đổ Sương Xuống',
    composer: 'Hải Linh',
    seasonGroup: 'Mùa Vọng',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Trời cao hãy đổ sương xuống, và ngàn mây hãy mưa Đấng Công Chính...',
    usageNote: 'Bài ca truyền thống Mùa Vọng được Ủy ban Thánh nhạc TGP Hà Nội khuyên dùng.',
  },
  {
    id: 'mv-2',
    part: 'Ca dâng lễ',
    title: 'Dâng Niềm Trông Đợi',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Mùa Vọng',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Cùng với bánh miến và rượu nho thơm ngát, xin tiến dâng tâm hồn tỉnh thức...',
    usageNote: 'Chuẩn bị lễ vật với tinh thần khiêm nhu đợi trông Chúa Ngự Đến.',
  },
  {
    id: 'mv-3',
    part: 'Ca hiệp lễ',
    title: 'Marana Tha — Lạy Chúa Xin Ngự Đến',
    composer: 'Lm. Xuân Thảo',
    seasonGroup: 'Mùa Vọng',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Lạy Chúa Giêsu xin hãy đến trong tâm hồn con hôm nay...',
    usageNote: 'Phù hợp tâm tình rước lễ suốt 4 tuần Mùa Vọng.',
  },
  {
    id: 'mv-4',
    part: 'Ca kết lễ',
    title: 'Sẵn Sàng Đón Chúa',
    composer: 'Viết Chung',
    seasonGroup: 'Mùa Vọng',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Hãy thắp sáng ngọn đèn đức tin, tỉnh thức đón chờ Đấng Cứu Độ...',
    usageNote: 'Kết lễ nhẹ nhàng, không dùng nhạc cụ quá ồn ào theo quy chế Mùa Vọng.',
  },

  // MÙA GIÁNG SINH (Áo lễ Trắng / Vàng)
  {
    id: 'gs-1',
    part: 'Ca nhập lễ',
    title: 'Đêm Đông Lạnh Lẽo',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Mùa Giáng Sinh',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Đêm đông lạnh lẽo Chúa sinh ra đời, Chúa sinh ra đời nằm trong hang đá...',
    usageNote: 'Bài hát Giáng Sinh quen thuộc trong phụng vụ các giáo xứ miền Bắc.',
  },
  {
    id: 'gs-2',
    part: 'Ca dâng lễ',
    title: 'Dâng Chúa Hài Đồng',
    composer: 'Ngọc Kôn',
    seasonGroup: 'Mùa Giáng Sinh',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Này đây bánh miến tinh tuyền cùng chén rượu thơm dâng lên Hài Nhi Giêsu...',
    usageNote: 'Tâm tình đơn sơ như các mục đồng Bêlem.',
  },
  {
    id: 'gs-3',
    part: 'Ca hiệp lễ',
    title: 'Lắng Nghe Lời Ngôi Lời',
    composer: 'Nguyễn Duy',
    seasonGroup: 'Mùa Giáng Sinh',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Ngôi Lời đã hóa thành nhục thể và ở giữa chúng ta...',
    usageNote: 'Chiêm ngắm mầu nhiệm Nhập Thể khi hiệp lễ.',
  },
  {
    id: 'gs-4',
    part: 'Ca kết lễ',
    title: 'Cao Cung Lên',
    composer: 'Nguyễn Khắc Xuyên & Lm. Hoài Đức',
    seasonGroup: 'Mùa Giáng Sinh',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Cao cung lên khúc nhạc thiên thần, chúc tụng Chúa giữa nơi hang Bêlem...',
    usageNote: 'Tác phẩm kinh điển mừng Chúa Giáng Sinh.',
  },

  // MÙA CHAY (Áo lễ Tím)
  {
    id: 'mc-1',
    part: 'Ca nhập lễ',
    title: 'Từ Chốn Tối Tăm',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Mùa Chay',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Từ vực sâu con kêu lên Chúa, lạy Chúa xin lắng nghe tiếng con cầu khẩn...',
    usageNote: 'Hợp tâm tình thống hối Mùa Chay (không hát Alleluia trong Mùa Chay).',
  },
  {
    id: 'mc-2',
    part: 'Ca dâng lễ',
    title: 'Dâng Trái Tim Thống Hối',
    composer: 'Tâm Bảo',
    seasonGroup: 'Mùa Chay',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Tấm lòng tan nát khiêm cung, lạy Chúa xin đừng khinh chê...',
    usageNote: 'Ủy ban Thánh nhạc TGP Hà Nội lưu ý giữ nhịp trang nghiêm, tiết chế nhạc đệm.',
  },
  {
    id: 'mc-3',
    part: 'Ca hiệp lễ',
    title: 'Tình Yêu Thập Giá',
    composer: 'Lm. Thành Tâm',
    seasonGroup: 'Mùa Chay',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Không có tình yêu nào cao quý bằng tình yêu người hiến mạng vì bạn hữu...',
    usageNote: 'Suy tôn tình thương cứu độ của Chúa Giêsu.',
  },
  {
    id: 'mc-4',
    part: 'Ca kết lễ',
    title: 'Con Nay Trở Về',
    composer: 'Nguyễn Duy',
    seasonGroup: 'Mùa Chay',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Con nay trở về cùng Chúa nhân từ, xin thứ tha muôn vàn lỗi lầm...',
    usageNote: 'Thích hợp các ngày Thứ Sáu Mùa Chay và sau Nghi thức Đàng Thánh Giá.',
  },

  // MÙA PHỤC SINH (Áo lễ Trắng / Vàng)
  {
    id: 'ps-1',
    part: 'Ca nhập lễ',
    title: 'Chúa Đã Phục Sinh — Allêluia',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Mùa Phục Sinh',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Allêluia! Chúa đã sống lại thật rồi, ánh sáng vinh quang bừng chiếu muôn nơi...',
    usageNote: 'Hát suốt 50 ngày Mùa Phục Sinh với âm hưởng hân hoan.',
  },
  {
    id: 'ps-2',
    part: 'Ca dâng lễ',
    title: 'Lễ Dâng Phục Sinh',
    composer: 'Lm. Thái Nguyên',
    seasonGroup: 'Mùa Phục Sinh',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Chúa Kitô là Chiên Vượt Qua đã chịu sát tế, cùng dâng lên Cha lễ vật tinh tuyền...',
    usageNote: 'Phù hợp các Chúa Nhật Mùa Phục Sinh.',
  },
  {
    id: 'ps-3',
    part: 'Ca hiệp lễ',
    title: 'Ở Lại Với Chúng Con',
    composer: 'Phanxicô',
    seasonGroup: 'Mùa Phục Sinh',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Xin ở lại với chúng con vì trời đã về chiều, lòng chúng con bừng cháy khi nghe Lời Ngài...',
    usageNote: 'Lấy ý từ Tin Mừng hai môn đệ làng Emmau.',
  },
  {
    id: 'ps-4',
    part: 'Ca kết lễ',
    title: 'Lạy Nữ Vương Thiên Đàng (Regina Caeli)',
    composer: 'Bình Ca & Lm. Kim Long',
    seasonGroup: 'Mùa Phục Sinh',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Lạy Nữ Vương Thiên Đàng hãy vui mừng, Allêluia! Vì Đấng Mẹ đã đáng cưu mang...',
    usageNote: 'Kinh kính Đức Mẹ đặc trưng thay cho Kinh Truyền Tin trong Mùa Phục Sinh.',
  },

  // LỄ ĐỨC MẸ & CÁC THÁNH TỬ ĐẠO (Áo lễ Trắng / Đỏ)
  {
    id: 'dm-1',
    part: 'Ca nhập lễ',
    title: 'Ca Mừng Các Thánh Tử Đạo Việt Nam',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Đức Mẹ & Tử Đạo',
    liturgicalColor: 'red',
    lyricsExcerpt: 'Tiếng hát hào hùng vang vọng quê hương, mừng các Thánh Tử Đạo Việt Nam anh dũng...',
    usageNote: 'Dùng trong Đại lễ Các Thánh Tử Đạo Việt Nam (24/11) và các lễ tử đạo áo Đỏ.',
  },
  {
    id: 'dm-2',
    part: 'Ca hiệp lễ',
    title: 'Máu Đào Chứng Nhân',
    composer: 'Hải Linh',
    seasonGroup: 'Đức Mẹ & Tử Đạo',
    liturgicalColor: 'red',
    lyricsExcerpt: 'Máu các Thánh Tử Đạo trổ sinh hạt giống đức tin trên đất Việt...',
    usageNote: 'Tôn vinh lòng trung kiên với Chúa Kitô.',
  },
  {
    id: 'dm-3',
    part: 'Ca kết lễ',
    title: 'Linh Hồn Tôi Ngợi Khen Chúa (Magnificat)',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Đức Mẹ & Tử Đạo',
    liturgicalColor: 'white',
    lyricsExcerpt: 'Linh hồn tôi ngợi khen Đức Chúa, thần trí tôi hớn hở vui mừng...',
    usageNote: 'Dùng cho các ngày lễ kính Đức Mẹ (áo Trắng/Vàng).',
  },

  // LỄ CẦU HỒN (Áo lễ Tím)
  {
    id: 'ch-1',
    part: 'Ca nhập lễ',
    title: 'Xin Cho Các Linh Hồn Nghỉ Ngơi',
    composer: 'Lm. Kim Long',
    seasonGroup: 'Lễ Cầu Hồn',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Lạy Chúa xin ban cho các linh hồn được nghỉ ngơi đời đời và ánh sáng ngàn thu chiếu soi...',
    usageNote: 'Thích hợp Lễ Cầu Cho Các Tín Hữu Đã Qua Đời (02/11) và các Thánh lễ An táng.',
  },
  {
    id: 'ch-2',
    part: 'Ca hiệp lễ',
    title: 'Chúa Là Sự Sống Lại',
    composer: 'Nguyễn Duy',
    seasonGroup: 'Lễ Cầu Hồn',
    liturgicalColor: 'purple',
    lyricsExcerpt: 'Ta là sự sống lại và là sự sống, ai tin vào Ta dù có chết cũng sẽ được sống...',
    usageNote: 'Niềm hy vọng Phục Sinh trong Thánh lễ cầu nguyện cho người đã khuất.',
  },
];

export function getSuggestedSeasonGroupForLiturgy(
  season: LiturgicalSeason,
  color: LiturgicalColor,
  feastTitle: string
): SacredHymnSuggestion['seasonGroup'] {
  const lower = feastTitle.toLowerCase();
  if (lower.includes('qua đời') || lower.includes('cầu hồn') || lower.includes('linh hồn')) {
    return 'Lễ Cầu Hồn';
  }
  if (color === 'red' || lower.includes('tử đạo') || lower.includes('đức mẹ')) {
    return 'Đức Mẹ & Tử Đạo';
  }
  if (season === 'Mùa Vọng') return 'Mùa Vọng';
  if (season === 'Mùa Giáng Sinh') return 'Mùa Giáng Sinh';
  if (season === 'Mùa Chay' || season === 'Tam Nhật Thánh') return 'Mùa Chay';
  if (season === 'Mùa Phục Sinh') return 'Mùa Phục Sinh';
  return 'Mùa Thường Niên';
}
