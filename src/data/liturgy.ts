import type {
  FeastRank,
  LiturgicalColor,
  LiturgicalDay,
  LiturgicalHymn,
  LiturgicalSeason,
  ResponsorialPsalm,
  ScriptureReading,
} from '../types/catholic';

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function getFirstAdventSunday(year: number): Date {
  // Sunday nearest to Nov 30 (between Nov 27 and Dec 3)
  const nov30 = new Date(year, 10, 30);
  const dow = nov30.getDay(); // 0 = Sun
  const offset = dow <= 3 ? -dow : 7 - dow;
  return addDays(nov30, offset);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function diffDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / 86400000);
}

export const COLOR_META: Record<
  LiturgicalColor,
  { nameVi: string; hex: string; borderHex: string; meaning: string }
> = {
  green: {
    nameVi: 'Xanh lá',
    hex: '#1F5E3B',
    borderHex: '#154229',
    meaning: 'Biểu trưng cho niềm hy vọng, sức sống thiêng liêng và sự tăng trưởng trong Chúa Thánh Thần vào Mùa Thường Niên.',
  },
  white: {
    nameVi: 'Vàng / Trắng',
    hex: '#D4A238',
    borderHex: '#9A6B11',
    meaning: 'Biểu trưng cho ánh sáng phục sinh, niềm vui, sự tinh tuyền và vinh quang các Thánh (Lễ Chúa, Đức Mẹ, Lễ Nhớ, Lễ Kính).',
  },
  red: {
    nameVi: 'Đỏ',
    hex: '#991B1B',
    borderHex: '#7F1D1D',
    meaning: 'Biểu trưng cho lửa mến Chúa Thánh Thần và máu đào chứng nhân đức tin (Lễ Lá, Thứ Sáu Tuần Thánh, Hiện Xuống, Các Thánh Tử Đạo).',
  },
  purple: {
    nameVi: 'Tím',
    hex: '#5B2168',
    borderHex: '#42164C',
    meaning: 'Biểu trưng cho tâm tình sám hối, tỉnh thức, cầu nguyện và đợi trông (Mùa Vọng, Mùa Chay, Lễ Cầu Hồn).',
  },
  rose: {
    nameVi: 'Hồng',
    hex: '#BE5A74',
    borderHex: '#933D54',
    meaning: 'Biểu trưng cho niềm vui rạng rỡ giữa mùa sám hối (Chúa Nhật III Mùa Vọng - Gaudete & Chúa Nhật IV Mùa Chay - Laetare).',
  },
};

export interface LiturgicalThemePalette {
  color: LiturgicalColor;
  labelVi: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  gradient: string;
  canvasGradient: string;
  tintBg: string;
  borderTint: string;
}

export function getLiturgicalTheme(color: LiturgicalColor): LiturgicalThemePalette {
  switch (color) {
    case 'green':
      return {
        color: 'green',
        labelVi: 'Mùa Thường Niên · Xanh lá & Vàng',
        primary: '#1F5E3B',
        primaryHover: '#16462B',
        secondary: '#B48A28',
        gradient: 'linear-gradient(135deg, #1F5E3B 0%, #B48A28 100%)',
        canvasGradient: 'linear-gradient(180deg, #F1F6EF 0%, #FBF9EE 45%, #FAF8F4 100%)',
        tintBg: '#EEF5EC',
        borderTint: 'rgba(31, 94, 59, 0.25)',
      };
    case 'red':
      return {
        color: 'red',
        labelVi: 'Áo lễ Đỏ · Lễ Trọng / Tử Đạo',
        primary: '#8B261D',
        primaryHover: '#6E1D15',
        secondary: '#C2410C',
        gradient: 'linear-gradient(135deg, #8B261D 0%, #C2410C 100%)',
        canvasGradient: 'linear-gradient(180deg, #FCF3F2 0%, #FAF5EF 45%, #FAF8F4 100%)',
        tintBg: '#FBECEB',
        borderTint: 'rgba(139, 38, 29, 0.25)',
      };
    case 'purple':
      return {
        color: 'purple',
        labelVi: 'Áo lễ Tím · Mùa Vọng / Chay / Cầu Hồn',
        primary: '#5B2168',
        primaryHover: '#44174E',
        secondary: '#7C3AED',
        gradient: 'linear-gradient(135deg, #5B2168 0%, #7C3AED 100%)',
        canvasGradient: 'linear-gradient(180deg, #F6F1FA 0%, #FAF6FC 45%, #FAF8F4 100%)',
        tintBg: '#F3EBF8',
        borderTint: 'rgba(91, 33, 104, 0.25)',
      };
    case 'white':
      return {
        color: 'white',
        labelVi: 'Áo lễ Vàng / Trắng · Lễ Nhớ / Lễ Kính',
        primary: '#9A6B11',
        primaryHover: '#7B540B',
        secondary: '#D4A238',
        gradient: 'linear-gradient(135deg, #9A6B11 0%, #D4A238 100%)',
        canvasGradient: 'linear-gradient(180deg, #FDF8EA 0%, #FAF7EE 45%, #FAF8F4 100%)',
        tintBg: '#FAF2D8',
        borderTint: 'rgba(154, 107, 17, 0.28)',
      };
    case 'rose':
      return {
        color: 'rose',
        labelVi: 'Áo lễ Hồng · Chúa Nhật Niềm Vui',
        primary: '#9E3B56',
        primaryHover: '#7D2C42',
        secondary: '#C58338',
        gradient: 'linear-gradient(135deg, #9E3B56 0%, #C58338 100%)',
        canvasGradient: 'linear-gradient(180deg, #FCF2F5 0%, #FAF6F7 45%, #FAF8F4 100%)',
        tintBg: '#FBEAF0',
        borderTint: 'rgba(158, 59, 86, 0.25)',
      };
  }
}

const WEEKDAYS_VI = [
  'Chúa Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

interface FixedFeastInfo {
  title: string;
  rank: FeastRank;
  color: LiturgicalColor;
  saints: { name: string; role: string; biography: string }[];
}

const FIXED_FEASTS: Record<string, FixedFeastInfo> = {
  '01-01': {
    title: 'Thánh Maria Đức Mẹ Chúa Trời',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Đức Maria, Mẹ Thiên Chúa',
        role: 'Bậc Mẹ của Ngôi Lời Nhập Thể',
        biography: 'Giáo Hội tôn vinh Đức Trinh Nữ Maria là Mẹ Thiên Chúa ngay ngày đầu năm mới dương lịch và cầu nguyện cho hòa bình thế giới.',
      },
    ],
  },
  '02-02': {
    title: 'Dâng Chúa Giêsu Trong Đền Thánh',
    rank: 'Lễ Kính',
    color: 'white',
    saints: [
      {
        name: 'Thánh Simêon & Bà Anna',
        role: 'Chứng nhân của Ánh Sáng Muôn Dân',
        biography: 'Ngày lễ Nến nhắc nhớ Chúa Kitô là Ánh Sáng soi đường cho muôn dân tộc.',
      },
    ],
  },
  '03-19': {
    title: 'Thánh Giuse, Bạn Trăm Năm Đức Trinh Nữ Maria',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Thánh Giuse Lao Động',
        role: 'Quan Thầy Giáo Hội Hoàn Vũ & Giáo Hội Việt Nam',
        biography: 'Đấng công chính, âm thầm lắng nghe thánh ý Thiên Chúa và bảo vệ Thánh Gia.',
      },
    ],
  },
  '03-25': {
    title: 'Lễ Truyền Tin',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Tổng Lãnh Thiên Thần Gabriel & Đức Maria',
        role: 'Mầu nhiệm Ngôi Lời Nhập Thể',
        biography: 'Tiếng "Xin Vâng" của Đức Maria mở đầu công trình cứu độ nhân loại.',
      },
    ],
  },
  '05-01': {
    title: 'Thánh Giuse Thợ',
    rank: 'Lễ Nhớ Tự Do',
    color: 'white',
    saints: [
      {
        name: 'Thánh Giuse Thợ Mộc thành Nadarét',
        role: 'Mẫu gương người lao động Kitô giáo',
        biography: 'Thánh hóa công việc lao động hằng ngày bằng tình yêu và trách nhiệm.',
      },
    ],
  },
  '06-24': {
    title: 'Sinh Nhật Thánh Gioan Tẩy Giả',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Thánh Gioan Tẩy Giả',
        role: 'Vị Tiền Hô của Đấng Cứu Thế',
        biography: 'Tiếng hô trong hoang địa dọn đường cho Chúa đến.',
      },
    ],
  },
  '06-29': {
    title: 'Thánh Phêrô và Thánh Phaolô Tông Đồ',
    rank: 'Lễ Trọng',
    color: 'red',
    saints: [
      {
        name: 'Thánh Phêrô & Thánh Phaolô',
        role: 'Hai cột trụ của Giáo Hội sơ khai',
        biography: 'Cùng làm chứng cho Chúa Kitô bằng máu tử đạo tại Roma.',
      },
    ],
  },
  '08-06': {
    title: 'Chúa Hiển Dung',
    rank: 'Lễ Kính',
    color: 'white',
    saints: [
      {
        name: 'Chúa Giêsu Biến Hình trên núi Tabor',
        role: 'Tỏ lộ vinh quang Phục Sinh',
        biography: 'Củng cố đức tin các Tông đồ trước cuộc Thương Khó.',
      },
    ],
  },
  '08-15': {
    title: 'Đức Mẹ Hồn Xác Lên Trời',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Đức Trinh Nữ Maria',
        role: 'Nữ Vương Trời Đất',
        biography: 'Đức Maria được rước cả hồn và xác về hưởng vinh quang Nước Trời.',
      },
    ],
  },
  '09-08': {
    title: 'Sinh Nhật Đức Trinh Nữ Maria',
    rank: 'Lễ Kính',
    color: 'white',
    saints: [
      {
        name: 'Đức Trinh Nữ Maria',
        role: 'Bình minh của ơn cứu độ',
        biography: 'Mừng ngày sinh của Mẹ Thiên Chúa, niềm vui của toàn thể Giáo Hội.',
      },
    ],
  },
  '09-14': {
    title: 'Suy Tôn Thánh Giá',
    rank: 'Lễ Kính',
    color: 'red',
    saints: [
      {
        name: 'Thánh Giá Chúa Kitô',
        role: 'Cây sự sống và ơn cứu độ',
        biography: 'Chiêm ngắm tình yêu tự hiến đến cùng của Chúa Giêsu.',
      },
    ],
  },
  '10-01': {
    title: 'Thánh Têrêsa Hài Đồng Giêsu',
    rank: 'Lễ Nhớ',
    color: 'white',
    saints: [
      {
        name: 'Thánh Têrêsa thành Lisieux',
        role: 'Trinh nữ, Tiến sĩ Hội Thánh & Bổn mạng các xứ truyền giáo',
        biography: 'Nổi tiếng với "Con đường thơ ấu thiêng liêng" làm những việc nhỏ với tình yêu lớn.',
      },
    ],
  },
  '10-07': {
    title: 'Đức Mẹ Mân Côi',
    rank: 'Lễ Nhớ',
    color: 'white',
    saints: [
      {
        name: 'Đức Mẹ Mân Côi',
        role: 'Nữ Vương Rất Thánh Mân Côi',
        biography: 'Mời gọi tín hữu chiêm ngắm các mầu nhiệm Chúa Kitô cùng với Mẹ Maria.',
      },
    ],
  },
  '11-01': {
    title: 'Các Thánh Nam Nữ',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Chư Thánh trên Thiên Đàng',
        role: 'Đoàn người muôn nước thuộc về Chúa',
        biography: 'Tôn vinh vô số vị thánh hiển danh và ẩn danh đã sống trọn vẹn Tám Mối Phúc.',
      },
    ],
  },
  '11-02': {
    title: 'Cầu Cho Các Tín Hữu Đã Qua Đời',
    rank: 'Lễ Nhớ',
    color: 'purple',
    saints: [
      {
        name: 'Các Đẳng Linh Hồn',
        role: 'Hội Thánh thanh luyện',
        biography: 'Giáo Hội hiệp lời cầu nguyện cho ông bà, cha mẹ và mọi tín hữu đã an nghỉ trong Chúa.',
      },
    ],
  },
  '11-15': {
    title: 'Chúa Nhật XXXIII Thường Niên',
    rank: 'Chúa Nhật',
    color: 'green',
    saints: [
      {
        name: 'Thánh Anbêrtô Cả',
        role: 'Giám mục, Tiến sĩ Hội Thánh (1200–1280)',
        biography: 'Thầy của Thánh Tôma Aquinô, nhà thần học và khoa học kết hợp đức tin với lý trí.',
      },
    ],
  },
  '11-16': {
    title: 'Thứ Hai Tuần XXXIII Thường Niên',
    rank: 'Lễ Nhớ Tự Do',
    color: 'green',
    saints: [
      {
        name: 'Thánh Magarita nước Scôtlen',
        role: 'Hoàng hậu, mẫu gương bác ái (1045–1093)',
        biography: 'Bà mẹ tám con, hết lòng phục vụ người nghèo, xây dựng bệnh viện và cầu nguyện không ngừng.',
      },
      {
        name: 'Thánh Giêrtruđê Trinh Nữ',
        role: 'Nữ tu Biển Đức, nhà thần bí (1256–1302)',
        biography: 'Nổi tiếng với lòng sùng kính Thánh Tâm Chúa Giêsu và đời sống chiêm niệm Lời Chúa sâu sắc.',
      },
    ],
  },
  '11-17': {
    title: 'Thánh Êlisabét nước Hungari, Nữ tu',
    rank: 'Lễ Nhớ',
    color: 'white',
    saints: [
      {
        name: 'Thánh Êlisabét nước Hungari',
        role: 'Công chúa, dòng Ba Phanxicô (1207–1231)',
        biography: 'Sau khi chồng qua đời, thánh nữ hiến trọn gia sản chăm sóc người bệnh phong và trẻ mồ côi.',
      },
    ],
  },
  '11-18': {
    title: 'Cung Hiến Đền Thờ Thánh Phêrô và Phaolô',
    rank: 'Lễ Nhớ Tự Do',
    color: 'white',
    saints: [
      {
        name: 'Thánh Phêrô & Thánh Phaolô',
        role: 'Kính nhớ hai Vương cung Thánh đường tại Roma',
        biography: 'Dấu chỉ hiệp nhất đức tin tông truyền với Đấng kế vị Thánh Phêrô.',
      },
    ],
  },
  '11-19': {
    title: 'Thứ Năm Tuần XXXIII Thường Niên',
    rank: 'Ngày Thường',
    color: 'green',
    saints: [
      {
        name: 'Thánh Mechthildis',
        role: 'Nữ tu dòng Xitô',
        biography: 'Gương mặt khiêm nhu cầu nguyện và phó thác trong tu viện Helfta.',
      },
    ],
  },
  '11-20': {
    title: 'Thứ Sáu Tuần XXXIII Thường Niên',
    rank: 'Ngày Thường',
    color: 'green',
    saints: [
      {
        name: 'Thánh Félix de Valois',
        role: 'Đồng sáng lập dòng Chúa Ba Ngôi',
        biography: 'Hiến thân chuộc các tù nhân Kitô giáo bị giam cầm.',
      },
    ],
  },
  '11-21': {
    title: 'Đức Mẹ Dâng Mình Trong Đền Thờ',
    rank: 'Lễ Nhớ',
    color: 'white',
    saints: [
      {
        name: 'Đức Trinh Nữ Maria',
        role: 'Đền thờ sống động của Thiên Chúa',
        biography: 'Nhắc nhớ tâm tình dâng hiến trọn vẹn cuộc đời cho Thiên Chúa từ thuở thiếu thời.',
      },
    ],
  },
  '11-22': {
    title: 'Lễ Chúa Giêsu Kitô Vua Vũ Trụ',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Thánh Cêcilia',
        role: 'Trinh nữ, Tử đạo (Bổn mạng các ca đoàn)',
        biography: 'Hát ca ngợi Chúa trong tâm hồn ngay cả giữa thử thách tử đạo.',
      },
    ],
  },
  '11-23': {
    title: 'Thứ Hai Tuần XXXIV Thường Niên',
    rank: 'Lễ Nhớ Tự Do',
    color: 'green',
    saints: [
      {
        name: 'Thánh Clêmentê I',
        role: 'Giáo hoàng, Tử đạo',
        biography: 'Vị Giáo hoàng thứ tư của Giáo Hội, tác giả bức thư nổi tiếng gửi giáo đoàn Côrintô.',
      },
    ],
  },
  '11-24': {
    title: 'Các Thánh Tử Đạo Việt Nam',
    rank: 'Lễ Trọng',
    color: 'red',
    saints: [
      {
        name: 'Thánh Anrê Dũng Lạc và 116 Bạn Tử Đạo',
        role: 'Các chứng nhân đức tin tại Việt Nam (thế kỷ XVII–XIX)',
        biography: 'Máu của các linh mục, tu sĩ và giáo dân Việt Nam đã trở thành hạt giống trổ sinh Giáo Hội Việt Nam hôm nay.',
      },
    ],
  },
  '11-25': {
    title: 'Thứ Tư Tuần XXXIV Thường Niên',
    rank: 'Lễ Nhớ Tự Do',
    color: 'green',
    saints: [
      {
        name: 'Thánh Catarina Alexandria',
        role: 'Trinh nữ, Tử đạo',
        biography: 'Nổi tiếng vì sự khôn ngoan bảo vệ đức tin trước các triết gia.',
      },
    ],
  },
  '11-29': {
    title: 'Chúa Nhật I Mùa Vọng',
    rank: 'Chúa Nhật',
    color: 'purple',
    saints: [
      {
        name: 'Khởi đầu Năm Phụng Vụ Mới',
        role: 'Tỉnh thức và sẵn sàng',
        biography: 'Giáo Hội bước vào Mùa Vọng, chuẩn bị tâm hồn đón Chúa Kitô ngự đến.',
      },
    ],
  },
  '11-30': {
    title: 'Thánh Anrê Tông Đồ',
    rank: 'Lễ Kính',
    color: 'red',
    saints: [
      {
        name: 'Thánh Anrê Tông Đồ',
        role: 'Người anh của Thánh Phêrô, người môn đệ đầu tiên',
        biography: 'Chính thánh nhân đã dẫn em mình là Simon Phêrô đến gặp Đức Giêsu.',
      },
    ],
  },
  '12-03': {
    title: 'Thánh Phanxicô Xaviê, Linh mục',
    rank: 'Lễ Kính',
    color: 'white',
    saints: [
      {
        name: 'Thánh Phanxicô Xaviê',
        role: 'Bổn mạng các xứ truyền giáo Á Châu',
        biography: 'Nhà truyền giáo vĩ đại mang Tin Mừng đến Ấn Độ, Nhật Bản và vùng Viễn Đông.',
      },
    ],
  },
  '12-08': {
    title: 'Đức Mẹ Vô Nhiễm Nguyên Tội',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Đức Trinh Nữ Maria Vô Nhiễm',
        role: 'Bổn mạng Giáo Hội Việt Nam',
        biography: 'Từ giây phút đầu tiên tượng thai, Đức Maria đã được gìn giữ tinh tuyền nhờ ơn cứu độ của Chúa Kitô.',
      },
    ],
  },
  '12-12': {
    title: 'Đức Mẹ Guadalupe',
    rank: 'Lễ Nhớ Tự Do',
    color: 'white',
    saints: [
      {
        name: 'Đức Mẹ Guadalupe',
        role: 'Mẹ của mọi dân tộc châu Mỹ',
        biography: 'Hiện ra với thánh Juan Diego cùng lời an ủi đầy tình mẫu tử.',
      },
    ],
  },
  '12-25': {
    title: 'Đại Lễ Chúa Giáng Sinh',
    rank: 'Lễ Trọng',
    color: 'white',
    saints: [
      {
        name: 'Hài Nhi Giêsu tại Bêlem',
        role: 'Ngôi Lời đã làm người và ở giữa chúng ta',
        biography: 'Thiên Chúa xuống thế làm người trong máng cỏ nghèo hèn để mang lại bình an cho nhân loại.',
      },
    ],
  },
  '12-26': {
    title: 'Thánh Stêphanô, Tử đạo tiên khởi',
    rank: 'Lễ Kính',
    color: 'red',
    saints: [
      {
        name: 'Thánh Stêphanô Phó Tế',
        role: 'Vị tử đạo đầu tiên của Giáo Hội',
        biography: 'Tha thứ cho những kẻ ném đá mình theo gương Chúa Giêsu trên thập giá.',
      },
    ],
  },
  '12-27': {
    title: 'Thánh Gioan Tông Đồ, Thánh Sử',
    rank: 'Lễ Kính',
    color: 'white',
    saints: [
      {
        name: 'Thánh Gioan Tông Đồ',
        role: 'Người môn đệ Chúa yêu',
        biography: 'Tác giả Tin Mừng thứ tư, khẳng định "Thiên Chúa là Tình Yêu".',
      },
    ],
  },
  '12-28': {
    title: 'Các Thánh Anh Hài',
    rank: 'Lễ Kính',
    color: 'red',
    saints: [
      {
        name: 'Các Thánh Anh Hài Tử Đạo',
        role: 'Những chứng nhân bé nhỏ tại Bêlem',
        biography: 'Giáo Hội cầu nguyện cho mọi trẻ em vô tội đang chịu bạo lực và nghèo đói.',
      },
    ],
  },
};

interface DailyScriptureBundle {
  reading1: ScriptureReading;
  psalm: ResponsorialPsalm;
  reading2: ScriptureReading | null;
  gospelAcclamation: string;
  gospel: ScriptureReading;
  hymns: LiturgicalHymn[];
  examenQuestions: string[];
}

const CURATED_BUNDLES: Record<string, DailyScriptureBundle> = {
  '2026-11-16': {
    reading1: {
      label: 'Bài đọc 1',
      citation: 'Kh 1, 1-4; 2, 1-5a',
      title: 'Khởi đầu sách Khải Huyền — Hãy nhớ lại tình yêu thuở ban đầu',
      intro: 'Bài trích sách Khải Huyền của thánh Gioan Tông đồ.',
      verses: [
        'Đây là mặc khải của Đức Giêsu Kitô, mà Thiên Chúa đã ban cho Người, để Người tỏ cho các tôi tớ của Người biết những điều sắp phải xảy đến. Người đã sai thiên sứ của Người đến báo cho tôi tớ Người là ông Gioan biết.',
        'Tôi là Gioan, gửi bảy Hội Thánh ở miền A-xi-a: chúc anh em được ân sủng và bình an của Đấng hiện có, đã có và đang đến, cùng của bảy thần khí trước ngai Thiên Chúa.',
        'Đức Chúa phán với thiên thần của Hội Thánh Ê-phê-xô: "Ta biết các việc ngươi làm, nỗi vất vả và lòng kiên nhẫn của ngươi. Ngươi đã chịu đựng nhiều vì danh Ta mà không hề mệt mỏi. Nhưng Ta trách ngươi điều này: ngươi đã đánh mất tình yêu thuở ban đầu. Vậy hãy nhớ lại xem ngươi đã sa sút từ đâu, hãy ăn năn hối cải và làm lại những việc như thuở ban đầu."',
      ],
      suggestedQuotes: [
        {
          text: 'Hãy nhớ lại xem ngươi đã sa sút từ đâu, hãy ăn năn hối cải và làm lại những việc như thuở ban đầu.',
          reference: 'Kh 2, 5a',
        },
        {
          text: 'Ngươi đã chịu đựng nhiều vì danh Ta mà không hề mệt mỏi.',
          reference: 'Kh 2, 3',
        },
      ],
    },
    psalm: {
      citation: 'Tv 1, 1-2. 3. 4 và 6 (Đ. Kh 2, 7)',
      refrain: 'Ai thắng, Ta sẽ cho ăn trái cây trường sinh mọc trong vườn Địa Đàng của Thiên Chúa.',
      stanzas: [
        'Phúc thay người chẳng nghe theo lời bọn ác nhân, chẳng bước vào đường quân tội lỗi, không nhập bọn với phường ngạo mạn kiêu căng, nhưng vui thú với lề luật Chúa, và nhẩm đi nhẩm lại suốt đêm ngày.',
        'Người ấy tựa cây trồng bên dòng nước, cứ đúng mùa là trổ sinh hoa trái, cành lá chẳng hề tàn úa bao giờ. Mọi sự người làm đều hanh thông thuận lợi.',
        'Ác nhân đâu có được như vậy! Chúng khác nào vỏ trấu gió thổi bay. Bởi vì Chúa hằng che chở nẻo đường người công chính, còn đường lối ác nhân đưa tới chỗ diệt vong.',
      ],
    },
    reading2: null,
    gospelAcclamation: 'Allêluia, Allêluia! Chúa phán: Ta là ánh sáng thế gian; ai theo Ta sẽ được ánh sáng ban sự sống. Allêluia.',
    gospel: {
      label: 'Tin Mừng',
      citation: 'Lc 18, 35-43',
      title: 'Đức Giêsu chữa người mù tại Giêrikhô',
      intro: 'Tin Mừng Chúa Giêsu Kitô theo thánh Luca.',
      verses: [
        'Khi Đức Giêsu gần đến Giêrikhô, có một người mù đang ngồi ăn xin ở vệ đường. Nghe thấy đám đông đi qua, anh ta hỏi xem có chuyện gì. Họ báo cho anh biết là Đức Giêsu Na-da-rét đang đi qua đó.',
        'Anh liền kêu lên rằng: "Lạy ông Giêsu, Con vua Đavít, xin dủ lòng thương tôi!" Những người đi đầu quát nạt, bảo anh im đi; nhưng anh càng kêu to hơn: "Lạy Con vua Đavít, xin dủ lòng thương tôi!"',
        'Đức Giêsu đứng lại, truyền dẫn anh đến với Người. Khi anh đã đến gần, Người hỏi anh: "Anh muốn tôi làm gì cho anh?" Anh thưa: "Lạy Ngài, xin cho tôi được nhìn thấy." Đức Giêsu nói với anh: "Anh hãy nhìn thấy đi! Lòng tin của anh đã cứu chữa anh."',
        'Ngay lập tức, anh nhìn thấy được và đi theo Người, vừa đi vừa tôn vinh Thiên Chúa. Thấy vậy, toàn dân cất tiếng ngợi khen Thiên Chúa.',
      ],
      suggestedQuotes: [
        {
          text: 'Lạy Ngài, xin cho tôi được nhìn thấy. — Anh hãy nhìn thấy đi! Lòng tin của anh đã cứu chữa anh.',
          reference: 'Lc 18, 41-42',
        },
        {
          text: 'Lạy Con vua Đavít, xin dủ lòng thương tôi!',
          reference: 'Lc 18, 38',
        },
      ],
    },
    hymns: [
      {
        part: 'Ca nhập lễ',
        title: 'Chúa Là Gia Nghiệp Đời Con',
        composer: 'Lm. Kim Long',
        lyricsExcerpt: 'Chúa là gia nghiệp đời con, nguồn vui muôn thuở con hằng khát khao. Bước vào thánh điện dâng lời cảm tạ...',
        liturgicalNote: 'Khơi dậy tâm tình phó thác và tìm kiếm ánh sáng của Chúa ngay đầu Thánh lễ.',
      },
      {
        part: 'Ca dâng lễ',
        title: 'Dâng Lên Chúa',
        composer: 'Lm. Nguyễn Duy',
        lyricsExcerpt: 'Cùng với bánh miến thơm nồng và rượu nho tinh tuyền, xin dâng lên Chúa trọn niềm tin yêu...',
        liturgicalNote: 'Hòa cùng lễ vật bánh rượu là cả ngày sống và những cố gắng khiêm tốn của bản thân.',
      },
      {
        part: 'Ca hiệp lễ',
        title: 'Xin Cho Con Nhìn Thấy Ngài',
        composer: 'Thánh Ca Phụng Vụ',
        lyricsExcerpt: 'Lạy Chúa Giêsu, xin mở mắt tâm hồn con, để giữa bao ồn ào trần gian con nhận ra bước chân Ngài...',
        liturgicalNote: 'Gắn trực tiếp với lời cầu của người mù Giêrikhô trong Tin Mừng Luca 18.',
      },
      {
        part: 'Ca kết lễ',
        title: 'Ra Đi Trong Bình An',
        composer: 'Phanxicô',
        lyricsExcerpt: 'Tạ ơn Chúa đã nuôi dưỡng chúng con bằng Lời Hằng Sống, xin sai chúng con đi làm chứng nhân yêu thương...',
        liturgicalNote: 'Thúc đẩy quyết tâm bước theo Chúa và tôn vinh Người trong đời sống thường nhật.',
      },
    ],
    examenQuestions: [
      'Trong ngày hôm nay, có "tiếng ồn" hay sự ngại ngùng nào khiến tôi im lặng, không dám kêu cầu Chúa như người mù thành Giêrikhô không?',
      'Nếu Chúa Giêsu dừng lại và hỏi tôi ngay lúc này: "Con muốn Thầy làm gì cho con?", điều sâu thẳm nhất tôi khao khát được Chúa chữa lành là gì?',
      'So với "tình yêu thuở ban đầu" dành cho Chúa và gia đình (Kh 2,4), hôm nay tôi đã giữ được sự ân cần hay đã để lòng nguội lạnh ở điểm nào?',
    ],
  },
  '2026-11-15': {
    reading1: {
      label: 'Bài đọc 1',
      citation: 'Ml 3, 19-20a',
      title: 'Mặt trời công chính sẽ mọc lên cho những ai kính sợ Danh Chúa',
      intro: 'Bài trích sách ngôn sứ Malakhi.',
      verses: [
        'Này ngày của Đức Chúa đang đến, cháy như hỏa lò. Mọi kẻ kiêu căng và mọi kẻ làm điều gian ác sẽ như rơm rác. Ngày đang tới sẽ thiêu đốt chúng — Đức Chúa các đạo binh phán — đến nỗi không còn để lại cho chúng một cành một rễ nào.',
        'Nhưng đối với các ngươi, những kẻ kính sợ Danh Ta, mặt trời công chính sẽ mọc lên, mang theo ơn chữa lành dưới cánh.',
      ],
      suggestedQuotes: [
        {
          text: 'Đối với các ngươi, những kẻ kính sợ Danh Ta, mặt trời công chính sẽ mọc lên, mang theo ơn chữa lành dưới cánh.',
          reference: 'Ml 3, 20a',
        },
      ],
    },
    psalm: {
      citation: 'Tv 98, 5-6. 7-8. 9 (Đ. c. 9)',
      refrain: 'Chúa ngự đến xét xử muôn dân theo lẽ công minh.',
      stanzas: [
        'Hãy gảy đàn ca ngợi Chúa, dâng tiếng đàn cùng khúc hát tôn vinh. Hãy thổi kèn, rúc tù và tung hô trước tôn nhan Đức Vua là Thiên Chúa.',
        'Biển cả và muôn vật trong biển hãy gầm vang, địa cầu cùng dân cư trên mặt đất hãy reo hò. Sông ngòi hãy vỗ tay, núi non hãy đồng thanh hoan hỉ.',
        'Trước tôn nhan Chúa, vì Người đang ngự đến xét xử trần gian. Người xét xử địa cầu theo đường công chính, và muôn dân theo lẽ thẳng ngay.',
      ],
    },
    reading2: {
      label: 'Bài đọc 2',
      citation: '2 Tx 3, 7-12',
      title: 'Ai không chịu làm việc thì đừng ăn',
      intro: 'Bài trích thư thứ hai của thánh Phaolô Tông đồ gửi tín hữu Thêxalônica.',
      verses: [
        'Thưa anh em, chính anh em biết anh em phải bắt chước chúng tôi thế nào: khi ở giữa anh em, chúng tôi đã không sống vô kỷ luật, cũng không ăn bám ai; trái lại, chúng tôi đã làm việc vất vả cực nhọc đêm ngày, để khỏi thành gánh nặng cho bất cứ ai trong anh em.',
        'Khi còn ở với anh em, chúng tôi đã chỉ thị cho anh em rằng: ai không chịu làm việc thì đừng ăn! Quả thế, chúng tôi nghe nói trong anh em có những kẻ sống vô kỷ luật, chẳng làm việc gì mà chỉ lo chuyện bao đồng. Nhân danh Chúa Giêsu Kitô, chúng tôi truyền dạy và khuyên nhủ những người ấy hãy ở yên ổn làm ăn cho có của mình mà dùng.',
      ],
      suggestedQuotes: [
        {
          text: 'Hãy làm việc âm thầm và bền bỉ trong tinh thần bình an của Chúa Kitô.',
          reference: '2 Tx 3, 12',
        },
      ],
    },
    gospelAcclamation: 'Allêluia, Allêluia! Anh em hãy đứng thẳng và ngẩng đầu lên, vì ơn cứu chuộc anh em đã gần đến. Allêluia.',
    gospel: {
      label: 'Tin Mừng',
      citation: 'Lc 21, 5-19',
      title: 'Có bền đỗ mới giữ được mạng sống mình',
      intro: 'Tin Mừng Chúa Giêsu Kitô theo thánh Luca.',
      verses: [
        'Nhân có mấy người nói về Đền Thờ được trang hoàng bằng những viên đá đẹp và những đồ dâng cúng, Đức Giêsu bảo: "Những gì anh em đang ngắm nhìn đây, sẽ có ngày không còn tảng đá nào trên tảng đá nào mà chẳng bị tàn phá."',
        'Họ hỏi Người: "Thưa Thầy, bao giờ các sự việc ấy sẽ xảy ra?" Người đáp: "Anh em hãy coi chừng kẻo bị lừa gạt... Khi nghe nói có chiến tranh và loạn lạc, đừng sợ hãi. Người ta sẽ tra tay bắt và ngược đãi anh em, nhưng đó sẽ là cơ hội để anh em làm chứng."',
        'Thầy sẽ ban cho anh em ăn nói khôn ngoan, khiến tất cả địch thù không tài nào chống chọi hay cãi lại được. Nhưng ngay cả một sợi tóc trên đầu anh em cũng chẳng mất đâu. Có bền đỗ, anh em mới giữ được mạng sống mình.',
      ],
      suggestedQuotes: [
        {
          text: 'Có bền đỗ, anh em mới giữ được mạng sống mình.',
          reference: 'Lc 21, 19',
        },
      ],
    },
    hymns: [
      {
        part: 'Ca nhập lễ',
        title: 'Bước Vào Nhà Chúa',
        composer: 'Lm. Kim Long',
        lyricsExcerpt: 'Chúa phán: Ta nghĩ tới bình an chứ không nghĩ tới tai ương, các ngươi sẽ kêu cầu Ta và Ta sẽ lắng nghe...',
        liturgicalNote: 'Điệp ca nhập lễ truyền thống của Chúa Nhật XXXIII Thường Niên.',
      },
      {
        part: 'Ca dâng lễ',
        title: 'Lễ Dâng Giao Hòa',
        composer: 'Nguyễn Duy',
        lyricsExcerpt: 'Đoàn con xin dâng bánh thơm nồng với rượu tinh tuyền, dâng cả lao công sớm chiều...',
        liturgicalNote: 'Gắn với lời nhắn nhủ siêng năng làm việc trong Bài đọc 2.',
      },
      {
        part: 'Ca hiệp lễ',
        title: 'Chính Chúa Là Đá Tảng',
        composer: 'Thánh Ca Việt Nam',
        lyricsExcerpt: 'Dẫu trần gian đổi thay vần vũ, tình yêu Chúa muôn đời chẳng phai...',
        liturgicalNote: 'Nhấn mạnh sự vững bền nơi Thiên Chúa khi mọi công trình trần thế qua đi.',
      },
      {
        part: 'Ca kết lễ',
        title: 'Trung Kiên Làm Chứng Nhân',
        composer: 'Viết Chung',
        lyricsExcerpt: 'Nguyện bước theo Thầy dù đường đời lắm gian truân, bền tâm giữ trọn niềm tin sắt son...',
        liturgicalNote: 'Khích lệ lòng kiên trì làm chứng nhân Tin Mừng trong tuần mới.',
      },
    ],
    examenQuestions: [
      'Hôm nay tôi có đang đặt niềm cậy trông vào những thứ mau qua hay đặt nền tảng nơi Thiên Chúa hằng hữu?',
      'Trong công việc và bổn phận gia đình, tôi đã làm việc với tinh thần trung thực, siêng năng như thánh Phaolô nhắn nhủ chưa?',
      'Trước những lo âu hay hiểu lầm, tôi có giữ được sự bền đỗ và bình an trong Chúa không?',
    ],
  },
  '2026-11-22': {
    reading1: {
      label: 'Bài đọc 1',
      citation: '2 Sm 5, 1-3',
      title: 'Các chi tộc Israel xức dầu tấn phong Đavít làm vua',
      intro: 'Bài trích sách Sa-mu-en quyển thứ hai.',
      verses: [
        'Tất cả các chi tộc Israel đến gặp vua Đavít tại Khép-ron và nói rằng: "Này chúng tôi là cốt nhục của ngài... Chính Chúa đã phán với ngài: Ngươi sẽ chăn dắt Israel dân Ta, và sẽ làm thủ lãnh Israel."',
        'Mọi kỳ mục Israel đến với vua tại Khép-ron, vua Đavít lập giao ước với họ trước nhan Chúa, và họ xức dầu tấn phong Đavít làm vua Israel.',
      ],
      suggestedQuotes: [
        {
          text: 'Ngươi sẽ chăn dắt Israel dân Ta.',
          reference: '2 Sm 5, 2',
        },
      ],
    },
    psalm: {
      citation: 'Tv 122, 1-2. 3-4ab. 4cd-5 (Đ. c. 1)',
      refrain: 'Tôi vui mừng khi người ta nói với tôi: Chúng ta hãy tiến vào nhà Chúa.',
      stanzas: [
        'Tôi vui mừng khi thiên hạ bảo tôi: "Ta cùng trẩy lên đền thánh Chúa." Giờ đây, Giêrusalem hỡi, cửa thành ngươi, ta đã dừng chân.',
        'Giêrusalem khác nào đô thị được xây dựng nên thật khang trang. Từng chi tộc, các chi tộc của Chúa, trẩy lên đền tiến bước vào đây.',
      ],
    },
    reading2: {
      label: 'Bài đọc 2',
      citation: 'Cl 1, 12-20',
      title: 'Thiên Chúa đã đưa chúng ta vào vương quốc của Con yêu dấu Người',
      intro: 'Bài trích thư của thánh Phaolô Tông đồ gửi tín hữu Côlôsê.',
      verses: [
        'Thưa anh em, hãy vui mừng cảm tạ Chúa Cha, Đấng đã làm cho anh em trở nên xứng đáng chung hưởng gia nghiệp của các thánh trong miền ánh sáng.',
        'Người đã giải thoát chúng ta khỏi quyền lực tối tăm, và đưa vào vương quốc của Con yêu dấu Người, nơi chúng ta được ơn cứu chuộc và tha thứ tội lỗi. Người là hình ảnh Thiên Chúa vô hình, là trưởng tử sinh ra trước mọi loài thụ tạo.',
      ],
      suggestedQuotes: [
        {
          text: 'Thiên Chúa đã giải thoát chúng ta khỏi quyền lực tối tăm, và đưa vào vương quốc của Con yêu dấu Người.',
          reference: 'Cl 1, 13',
        },
      ],
    },
    gospelAcclamation: 'Allêluia, Allêluia! Chúc tụng Đấng nhân danh Chúa mà đến! Chúc tụng vương quốc đang tới của tổ phụ chúng ta là vua Đavít! Allêluia.',
    gospel: {
      label: 'Tin Mừng',
      citation: 'Lc 23, 35-43',
      title: 'Ông Giêsu ơi, khi ông vào Nước của ông, xin nhớ đến tôi',
      intro: 'Tin Mừng Chúa Giêsu Kitô theo thánh Luca.',
      verses: [
        'Khi Đức Giêsu bị đóng đinh trên thập giá, dân chúng đứng nhìn, còn các thủ lãnh thì buông lời cười nhạo: "Hắn đã cứu người khác, thì cứu lấy mình đi, nếu thật hắn là Đấng Kitô của Thiên Chúa!"',
        'Phía trên đầu Người, có bản án viết: "Đây là Vua người Do-thái." Một trong hai tên gian phi bị treo trên thập giá cũng nhục mạ Người. Nhưng tên kia mắng nó: "Mày đang chịu chung một hình phạt, vậy mà cả Thiên Chúa, mày cũng không biết sợ!"',
        'Rồi anh ta thưa với Đức Giêsu: "Ông Giêsu ơi, khi ông vào Nước của ông, xin nhớ đến tôi!" Và Người nói với anh: "Tôi bảo thật anh, hôm nay, anh sẽ được ở với tôi trên Thiên Đàng."',
      ],
      suggestedQuotes: [
        {
          text: 'Ông Giêsu ơi, khi ông vào Nước của ông, xin nhớ đến tôi! — Hôm nay, anh sẽ được ở với tôi trên Thiên Đàng.',
          reference: 'Lc 23, 42-43',
        },
      ],
    },
    hymns: [
      {
        part: 'Ca nhập lễ',
        title: 'Chiên Con Đã Bị Giết',
        composer: 'Thánh Ca Phụng Vụ',
        lyricsExcerpt: 'Chiên Con đã bị giết đáng lãnh nhận uy quyền, phú quý, khôn ngoan và vinh quang muôn đời...',
        liturgicalNote: 'Tôn vinh vương quyền khiêm hạ và yêu thương của Đức Kitô.',
      },
      {
        part: 'Ca dâng lễ',
        title: 'Dâng Về Vua Vũ Trụ',
        composer: 'Lm. Kim Long',
        lyricsExcerpt: 'Xin dâng lên Vua tình yêu lễ vật bình an, nguyện tâm hồn con luôn thuộc trọn về Ngài...',
        liturgicalNote: 'Dâng hiến chủ quyền đời sống mình cho Đức Kitô Vua.',
      },
      {
        part: 'Ca hiệp lễ',
        title: 'Nước Trời Là Bình An',
        composer: 'Nguyễn Duy',
        lyricsExcerpt: 'Ngai vàng của Chúa là Thập Giá yêu thương, triều thiên Chúa đội là mão gai nhân từ...',
        liturgicalNote: 'Chiêm ngắm vương quốc lòng thương xót nơi lời hứa với người trộm lành.',
      },
      {
        part: 'Ca kết lễ',
        title: 'Chúa Kitô Hôm Qua, Hôm Nay',
        composer: 'Phanxicô',
        lyricsExcerpt: 'Đức Kitô chiến thắng, Đức Kitô hiển trị, Đức Kitô làm Vua muôn đời...',
        liturgicalNote: 'Khép lại Năm Phụng Vụ trong niềm hân hoan tôn vinh Đức Kitô Vua.',
      },
    ],
    examenQuestions: [
      'Đức Giêsu làm Vua từ trên Thập Giá bằng sự tha thứ: hôm nay tôi có để Chúa làm Vua cai trị tâm trí và cách đối xử của tôi không?',
      'Tôi có sẵn sàng khiêm tốn nhận ra giới hạn của mình và thưa với Chúa như người trộm lành: "Xin nhớ đến con" không?',
      'Hôm nay tôi đã mang tinh thần hòa giải và thương xót đến cho một ai đó chưa?',
    ],
  },
  '2026-11-24': {
    reading1: {
      label: 'Bài đọc 1',
      citation: '2 Mcb 7, 1. 20-23. 27-29',
      title: 'Đấng Tạo Hóa sẽ trả lại cho các con hơi thở và sự sống',
      intro: 'Bài trích sách Ma-ca-bê quyển thứ hai.',
      verses: [
        'Trong cuộc bách hại, có bảy anh em cùng với bà mẹ bị bắt. Bà mẹ thật đáng khâm phục và xứng đáng được lưu danh hậu thế: trong một ngày, bà chứng kiến bảy người con chết thảm, thế mà bà vẫn can đảm chịu đựng, nhờ niềm cậy trông vào Đức Chúa.',
        'Bà nói với người con út: "Con ơi, xin con hãy ngước nhìn trời đất và muôn vật trong đó mà nhận biết rằng Thiên Chúa đã làm nên tất cả từ hư vô. Đừng sợ tên đao phủ này; hãy xứng đáng với các anh con mà đón nhận cái chết, để trong ngày Chúa thương xót, mẹ sẽ đón nhận con cùng với các anh con."',
      ],
      suggestedQuotes: [
        {
          text: 'Đấng Tạo Hóa vũ trụ sẽ trả lại cho các con hơi thở và sự sống, bởi vì các con coi trọng lề luật của Người hơn chính mạng sống mình.',
          reference: '2 Mcb 7, 23',
        },
      ],
    },
    psalm: {
      citation: 'Tv 126, 1-2ab. 2cd-3. 4-5. 6 (Đ. c. 5)',
      refrain: 'Ai nghẹn ngào ra đi gieo giống, mùa gặt mai sau khấp khởi mừng.',
      stanzas: [
        'Khi Chúa dẫn tù nhân Sion trở về, ta tưởng mình như giữa giấc mơ. Vang vang ngoài miệng câu cười nói, rộn rã trên môi khúc nhạc mừng.',
        'Lạy Chúa, xin dẫn đưa thân phận chúng con về, như dòng suối tràn về miền đất khô cằn. Ai nghẹn ngào ra đi gieo giống, mùa gặt mai sau khấp khởi mừng.',
      ],
    },
    reading2: {
      label: 'Bài đọc 2',
      citation: 'Rm 8, 31b-39',
      title: 'Ai có thể tách chúng ta ra khỏi tình yêu của Đức Kitô?',
      intro: 'Bài trích thư của thánh Phaolô Tông đồ gửi tín hữu Roma.',
      verses: [
        'Có Thiên Chúa bênh đỡ chúng ta, ai còn chống lại được chúng ta? Ai có thể tách chúng ta ra khỏi tình yêu của Đức Kitô? Phải chăng là gian truân, khốn khổ, đói rách, hiểm nguy, bắt bớ, gươm giáo?',
        'Nhưng trong mọi thử thách ấy, chúng ta toàn thắng nhờ Đấng đã yêu mến chúng ta. Vì tôi tin chắc rằng: cho dù là sự chết hay sự sống, hiện tại hay tương lai... không có gì tách được chúng ta ra khỏi tình yêu của Thiên Chúa thể hiện nơi Đức Giêsu Kitô, Chúa chúng ta.',
      ],
      suggestedQuotes: [
        {
          text: 'Ai có thể tách chúng ta ra khỏi tình yêu của Đức Kitô?',
          reference: 'Rm 8, 35',
        },
      ],
    },
    gospelAcclamation: 'Allêluia, Allêluia! Lạy Chúa, chúng con ngợi khen Chúa là Thiên Chúa, và tuyên xưng Chúa là Chúa tể; đoàn quân tử đạo mặc áo trắng tinh ngợi khen Chúa. Allêluia.',
    gospel: {
      label: 'Tin Mừng',
      citation: 'Lc 9, 23-26',
      title: 'Ai mất mạng sống mình vì Thầy sẽ cứu được mạng sống ấy',
      intro: 'Tin Mừng Chúa Giêsu Kitô theo thánh Luca.',
      verses: [
        'Khi ấy, Đức Giêsu nói với mọi người rằng: "Ai muốn theo Tôi, phải từ bỏ chính mình, vác thập giá mình hằng ngày mà theo. Quả vậy, ai muốn cứu mạng sống mình, thì sẽ mất; còn ai liều mất mạng sống mình vì Tôi, thì sẽ cứu được mạng sống ấy."',
        '"Vì người nào được cả thế giới mà phải đánh mất chính mình hay là thiệt thân, thì nào có lợi gì? Ai xấu hổ vì Tôi và những lời của Tôi, thì Con Người cũng sẽ xấu hổ vì kẻ ấy, khi Người ngự đến trong vinh quang của mình."',
      ],
      suggestedQuotes: [
        {
          text: 'Ai muốn theo Tôi, phải từ bỏ chính mình, vác thập giá mình hằng ngày mà theo.',
          reference: 'Lc 9, 23',
        },
      ],
    },
    hymns: [
      {
        part: 'Ca nhập lễ',
        title: 'Khúc Ca Các Thánh Tử Đạo Việt Nam',
        composer: 'Lm. Kim Long',
        lyricsExcerpt: 'Đây bao người anh dũng đã đổ máu đào vì Đức Kitô, trên quê hương Việt Nam ngàn năm rạng rỡ đức tin...',
        liturgicalNote: 'Ca tụng lòng trung kiên của 117 Thánh Tử Đạo quê hương.',
      },
      {
        part: 'Ca dâng lễ',
        title: 'Của Lễ Tử Đạo',
        composer: 'Hải Linh',
        lyricsExcerpt: 'Cùng với bánh rượu tinh tuyền, dâng lên Cha lòng trung thành giữ đạo cha ông...',
        liturgicalNote: 'Dâng lên Thiên Chúa tâm tình biết ơn gia sản đức tin.',
      },
      {
        part: 'Ca hiệp lễ',
        title: 'Hạt Lúa Gieo Vào Lòng Đất',
        composer: 'Lm. Thành Tâm',
        lyricsExcerpt: 'Nếu hạt lúa không thối đi thì trơ trọi một mình, nhưng nếu chết đi sẽ sinh nhiều bông hạt...',
        liturgicalNote: 'Suy niệm về hoa trái sự sống từ hy sinh hằng ngày.',
      },
      {
        part: 'Ca kết lễ',
        title: 'Con Cháu Các Thánh Tử Đạo',
        composer: 'Lm. Xuân Thảo',
        lyricsExcerpt: 'Tiếp bước cha ông vững vàng giữa đời, đem Tin Mừng yêu thương đi khắp muôn nơi...',
        liturgicalNote: 'Sai đi sống chứng nhân đức tin trong môi trường sống hôm nay.',
      },
    ],
    examenQuestions: [
      'Hôm nay tôi có can đảm sống trung thực với đức tin Công giáo trong công việc và lời nói, hay đã ngại ngùng thỏa hiệp?',
      '"Thập giá hằng ngày" mà Chúa trao cho tôi hôm nay là bổn phận hay thử thách nào, và tôi đã đón nhận với thái độ nào?',
      'Tôi đã làm gì để tiếp nối gia sản đức tin và lòng bác ái của các bậc tiền nhân?',
    ],
  },
};

function generateWeekdayOrSeasonBundle(
  date: Date,
  season: LiturgicalSeason,
  feastTitle: string,
  isSundayOrSolemnity: boolean
): DailyScriptureBundle {
  const dow = date.getDay();
  const day = date.getDate();

  if (season === 'Mùa Vọng') {
    return {
      reading1: {
        label: 'Bài đọc 1',
        citation: 'Is 2, 1-5',
        title: 'Chúa quy tụ muôn dân về Núi Thánh trong ánh sáng bình an',
        intro: 'Bài trích sách ngôn sứ I-sai-a.',
        verses: [
          'Vào những ngày cuối cùng, núi Đền Thờ Đức Chúa sẽ đứng vững trên đỉnh các ngọn núi, và muôn dân tộc sẽ lũ lượt kéo đến. Chúng sẽ đúc gươm đao thành cuốc thành cày, và không còn tập trận nữa.',
          'Nhà Gia-cóp hỡi, nào chúng ta hãy đi dưới ánh sáng của Đức Chúa.',
        ],
        suggestedQuotes: [
          {
            text: 'Nhà Gia-cóp hỡi, nào chúng ta hãy đi dưới ánh sáng của Đức Chúa.',
            reference: 'Is 2, 5',
          },
        ],
      },
      psalm: {
        citation: 'Tv 122, 1-2. 4-5. 6-9',
        refrain: 'Chúng ta hãy vui mừng tiến vào nhà Đức Chúa.',
        stanzas: [
          'Tôi vui mừng khi người ta nói với tôi: Ta cùng trẩy lên đền thánh Chúa.',
          'Hãy cầu chúc Giêrusalem được bình an: Ước chi trong tường lũy ngươi tràn đầy an thái.',
        ],
      },
      reading2: isSundayOrSolemnity
        ? {
            label: 'Bài đọc 2',
            citation: 'Rm 13, 11-14',
            title: 'Đã đến giờ anh em phải thức dậy',
            intro: 'Bài trích thư thánh Phaolô Tông đồ gửi tín hữu Roma.',
            verses: [
              'Anh em hãy biết thời buổi chúng ta đang sống: đã đến giờ anh em phải thức dậy sau giấc ngủ, vì ngày cứu độ chúng ta đã gần hơn lúc mới tin.',
              'Đêm sắp tàn, ngày gần đến. Vậy chúng ta hãy loại bỏ những việc làm đen tối và mặc lấy vũ khí của ánh sáng.',
            ],
            suggestedQuotes: [
              {
                text: 'Hãy mặc lấy Chúa Giêsu Kitô, Đấng là Ánh Sáng cứu độ.',
                reference: 'Rm 13, 14',
              },
            ],
          }
        : null,
      gospelAcclamation: 'Allêluia, Allêluia! Lạy Chúa, xin tỏ lòng từ bi cho chúng con thấy và ban ơn cứu độ cho chúng con. Allêluia.',
      gospel: {
        label: 'Tin Mừng',
        citation: 'Mt 24, 37-44',
        title: 'Hãy tỉnh thức và sẵn sàng đón Chúa ngự đến',
        intro: 'Tin Mừng Chúa Giêsu Kitô theo thánh Mátthêu.',
        verses: [
          'Khi ấy, Đức Giêsu nói với các môn đệ: "Anh em hãy canh thức, vì anh em không biết ngày nào Chúa của anh em đến. Hãy sẵn sàng, vì chính giờ phút anh em không ngờ, thì Con Người sẽ đến."',
        ],
        suggestedQuotes: [
          {
            text: 'Anh em hãy canh thức và sẵn sàng, vì chính giờ phút anh em không ngờ, thì Con Người sẽ đến.',
            reference: 'Mt 24, 42-44',
          },
        ],
      },
      hymns: [
        {
          part: 'Ca nhập lễ',
          title: 'Trời Cao Hãy Đổ Sương Xuống',
          composer: 'Lm. Kim Long',
          lyricsExcerpt: 'Trời cao hãy đổ sương xuống, và ngàn mây hãy mưa Đấng Công Chính...',
          liturgicalNote: 'Khúc hát khẩn nguyện đặc trưng của Mùa Vọng.',
        },
        {
          part: 'Ca dâng lễ',
          title: 'Dâng Niềm Trông Đợi',
          composer: 'Nguyễn Duy',
          lyricsExcerpt: 'Xin dâng lên Chúa tâm hồn tỉnh thức đợi trông Ánh Sáng Ngôi Lời...',
          liturgicalNote: 'Dâng lòng khao khát hoán cải trong tâm tình Mùa Vọng.',
        },
        {
          part: 'Ca hiệp lễ',
          title: 'Maranatha — Lạy Chúa Xin Hãy Đến',
          composer: 'Thánh Ca Phụng Vụ',
          lyricsExcerpt: 'Lạy Chúa Giêsu, xin hãy ngự đến trong máng cỏ tâm hồn chúng con...',
          liturgicalNote: 'Đón rước Chúa Thánh Thể trong sự mong đợi bình an.',
        },
        {
          part: 'Ca kết lễ',
          title: 'Dọn Đường Cho Chúa',
          composer: 'Phanxicô',
          lyricsExcerpt: 'Hãy san bằng mọi đồi cao kiêu ngạo, lấp đầy hố sâu hận thù bằng tình yêu thương...',
          liturgicalNote: 'Thực hành bác ái để chuẩn bị đường cho Chúa đến.',
        },
      ],
      examenQuestions: [
        'Hôm nay tâm hồn tôi có tỉnh thức trước sự hiện diện của Chúa, hay bị cuốn vào những bận tâm vội vã?',
        'Có thói quen nào tôi cần chỉnh sửa để dọn đường đón Chúa đến trong gia đình mình?',
      ],
    };
  }

  // Ordinary Time / Seasonal clean dynamic readings
  const weekdayCycleReadings = [
    {
      r1Cite: 'Kh 3, 1-6. 14-22',
      r1Title: 'Này Ta đứng trước cửa và gõ',
      r1Verses: [
        'Đức Chúa phán: "Này Ta đứng trước cửa và gõ. Ai nghe tiếng Ta và mở cửa, thì Ta sẽ vào nhà người ấy, sẽ dùng bữa với người ấy, và người ấy sẽ dùng bữa với Ta."',
        'Ai có tai thì hãy nghe điều Thần Khí nói với các Hội Thánh.',
      ],
      r1Quote: { text: 'Này Ta đứng trước cửa và gõ. Ai nghe tiếng Ta và mở cửa, thì Ta sẽ vào dùng bữa với người ấy.', reference: 'Kh 3, 20' },
      psCite: 'Tv 15, 2-3ab. 3cd-4ab. 5',
      psRefrain: 'Ai thắng, Ta sẽ cho ngồi cùng Ta trên ngai của Ta.',
      psStanzas: ['Ai sống trọn vẹn, thi hành điều công chính và nói năng chân thật từ đáy lòng; không buông lời gièm pha và chẳng làm hại anh em.'],
      gCite: 'Lc 19, 1-10',
      gTitle: 'Ông Giakêu đón Đức Giêsu vào nhà',
      gVerses: [
        'Khi Đức Giêsu đi ngang qua Giêrikhô, ông Giakêu — người đứng đầu những người thu thuế và rất giàu có — trèo lên cây sung để xem cho biết Người là ai.',
        'Khi đến chỗ ấy, Đức Giêsu nhìn lên và nói: "Này ông Giakêu, xuống mau đi, vì hôm nay tôi phải ở lại nhà ông!" Ông vội vàng tụt xuống và vui mừng đón rước Người. Ông thưa: "Thưa Ngài, đây phân nửa tài sản của tôi, tôi xin cho người nghèo; và nếu tôi đã chiếm đoạt của ai cái gì, tôi xin đền gấp bốn."',
        'Đức Giêsu nói với ông: "Hôm nay, ơn cứu độ đã đến cho nhà này, bởi vì Con Người đến để tìm và cứu những gì đã mất."',
      ],
      gQuote: { text: 'Hôm nay, ơn cứu độ đã đến cho nhà này.', reference: 'Lc 19, 9' },
      questions: [
        'Hôm nay Chúa gõ cửa lòng tôi qua biến cố hay con người nào, và tôi đã mở cửa đón tiếp hay đóng lại?',
        'Có điều bất công hoặc thiếu sót nào tôi cần can đảm sửa chữa và đền bù như ông Giakêu không?',
      ],
    },
    {
      r1Cite: 'Kh 4, 1-11',
      r1Title: 'Thánh, Thánh, Thánh, Đức Chúa là Thiên Chúa toàn năng',
      r1Verses: [
        'Tôi nhìn lên và thấy một cánh cửa mở rộng trên trời. Trước ngai Thiên Chúa, các thụ tạo ngày đêm không ngớt tung hô: "Thánh! Thánh! Thánh! Đức Chúa là Thiên Chúa toàn năng, Đấng đã có, hiện có và đang đến."',
      ],
      r1Quote: { text: 'Lạy Chúa là Thiên Chúa chúng con, Ngài xứng đáng lãnh nhận vinh quang, danh dự và uy quyền.', reference: 'Kh 4, 11' },
      psCite: 'Tv 150, 1-2. 3-4. 5-6',
      psRefrain: 'Thánh, Thánh, Thánh, Đức Chúa là Thiên Chúa các đạo binh.',
      psStanzas: ['Hãy ca ngợi Thiên Chúa trong thánh điện của Người, ca ngợi Người trên vòm trời uy linh!'],
      gCite: 'Lc 19, 11-28',
      gTitle: 'Dụ ngôn những nén bạc được trao phó',
      gVerses: [
        'Đức Giêsu kể dụ ngôn một người quý tộc trao cho các đầy tớ mười nén bạc và dặn: "Hãy lo làm ăn sinh lợi cho tới khi tôi trở về."',
        'Khi trở về, ông khen ngợi người đầy tớ trung tín: "Khá lắm, hỡi đầy tớ tài giỏi! Vì ngươi đã trung tín trong việc rất nhỏ, hãy cầm quyền cai trị mười thành."',
      ],
      gQuote: { text: 'Vì ngươi đã trung tín trong việc rất nhỏ, hãy lãnh phần thưởng lớn lao.', reference: 'Lc 19, 17' },
      questions: [
        'Hôm nay tôi đã sử dụng thời gian, sức khỏe và nén bạc Chúa trao để sinh lợi cho tha nhân như thế nào?',
        'Trong những việc nhỏ bé nhất của ngày sống, tôi có làm với lòng trung tín và yêu mến không?',
      ],
    },
    {
      r1Cite: 'Kh 5, 1-10',
      r1Title: 'Chiên Con xứng đáng mở cuộn sách',
      r1Verses: [
        'Các kỳ lão phủ phục trước Chiên Con và hát bài ca mới: "Ngài xứng đáng nhận cuộn sách và mở ấn niêm phong, vì Ngài đã bị giết và đã lấy máu mình chuộc về cho Thiên Chúa muôn người thuộc mọi chi tộc, ngôn ngữ, dân tộc và quốc gia."',
      ],
      r1Quote: { text: 'Ngài đã làm cho họ thành vương quốc và tư tế phụng sự Thiên Chúa.', reference: 'Kh 5, 10' },
      psCite: 'Tv 149, 1-2. 3-4. 5-6a và 9b',
      psRefrain: 'Lạy Chúa, Ngài đã làm cho chúng con thành vương quốc phụng sự Thiên Chúa.',
      psStanzas: ['Hãy hát mừng Chúa một bài ca mới, hãy ngợi khen Người giữa cộng đoàn các tín hữu trung thành.'],
      gCite: 'Lc 19, 41-44',
      gTitle: 'Đức Giêsu khóc thương thành Giêrusalem',
      gVerses: [
        'Khi đến gần Giêrusalem và trông thấy thành, Đức Giêsu bật khóc mà nói: "Phải chi ngày hôm nay ngươi cũng nhận biết những gì đem lại bình an cho ngươi! Nhưng hiện giờ điều ấy còn bị che khuất khỏi mắt ngươi."',
      ],
      gQuote: { text: 'Phải chi ngày hôm nay ngươi nhận biết những gì đem lại bình an cho ngươi!', reference: 'Lc 19, 42' },
      questions: [
        'Hôm nay tôi có nhận ra những phút giây Chúa thăm viếng và ban bình an cho mình không?',
        'Có ai quanh tôi đang cần một cái nhìn cảm thông và nước mắt chia sẻ của tôi như trái tim Đức Giêsu không?',
      ],
    },
    {
      r1Cite: 'Kh 10, 8-11',
      r1Title: 'Lời Chúa ngọt ngào như mật ong nhưng đòi hỏi hoán cải',
      r1Verses: [
        'Tôi đến gần thiên thần và xin ngài trao cho tôi cuốn sách nhỏ. Ngài bảo: "Hãy cầm lấy mà nuốt đi: nó sẽ làm cho bụng ngươi đắng cay, nhưng trong miệng ngươi, nó sẽ ngọt ngào như mật ong."',
      ],
      r1Quote: { text: 'Lời Chúa trong miệng ngọt ngào như mật ong, và dẫn ta đi truyền rao Chân Lý.', reference: 'Kh 10, 9' },
      psCite: 'Tv 119, 14. 24. 72. 103. 111. 131',
      psRefrain: 'Lạy Chúa, lời hứa của Ngài ngọt ngào biết bao cho khẩu vị con!',
      psStanzas: ['Con vui sướng bước theo đường huấn lệnh Ngài, hơn là có mọi thứ của cải trần gian.'],
      gCite: 'Lc 19, 45-48',
      gTitle: 'Nhà Ta là nhà cầu nguyện',
      gVerses: [
        'Đức Giêsu vào Đền Thờ và xua đuổi những kẻ buôn bán. Người nói với họ: "Đã có lời chép rằng: Nhà Ta sẽ là nhà cầu nguyện." Hằng ngày Người giảng dạy trong Đền Thờ, và toàn dân chăm chú lắng nghe Người.',
      ],
      gQuote: { text: 'Nhà Ta sẽ là nhà cầu nguyện.', reference: 'Lc 19, 46' },
      questions: [
        'Tâm hồn tôi hôm nay là "nhà cầu nguyện" tĩnh lặng hay đang bị lấp đầy bởi những toan tính ồn ào?',
        'Tôi có dành một khoảng thời gian riêng tư trong ngày để chăm chú lắng nghe Chúa nói không?',
      ],
    },
    {
      r1Cite: 'Kh 11, 4-12',
      r1Title: 'Hai chứng nhân trung thành của Thiên Chúa',
      r1Verses: [
        'Hai chứng nhân ấy làm chứng kiên cường suốt thời gian thử thách, và Thần Khí sự sống từ Thiên Chúa đã nhập vào họ, khiến họ đứng vững trên đôi chân mình.',
      ],
      r1Quote: { text: 'Thần Khí sự sống từ Thiên Chúa đã nâng họ đứng vững.', reference: 'Kh 11, 11' },
      psCite: 'Tv 144, 1. 2. 9-10',
      psRefrain: 'Chúc tụng Chúa là Đá Tảng của con.',
      psStanzas: ['Chúa là tình thương và thành lũy của con, là nơi con trú ẩn an toàn.'],
      gCite: 'Lc 20, 27-40',
      gTitle: 'Thiên Chúa là Thiên Chúa của kẻ sống',
      gVerses: [
        'Đức Giêsu đáp lời nhóm Xa-đốc: "Người không phải là Thiên Chúa của kẻ chết, nhưng là Thiên Chúa của kẻ sống, vì đối với Người, tất cả đều đang sống."',
      ],
      gQuote: { text: 'Thiên Chúa không phải là Thiên Chúa của kẻ chết, nhưng là Thiên Chúa của kẻ sống.', reference: 'Lc 20, 38' },
      questions: [
        'Đức tin vào sự sống đời đời hôm nay giúp tôi vượt qua nỗi sợ hãi hay chán nản nào?',
        'Hôm nay tôi có nhớ cầu nguyện cho các linh hồn thân yêu đã qua đời đang sống trong Chúa không?',
      ],
    },
  ];

  const picked = weekdayCycleReadings[(day + dow) % weekdayCycleReadings.length];

  return {
    reading1: {
      label: 'Bài đọc 1',
      citation: picked.r1Cite,
      title: picked.r1Title,
      intro: 'Bài trích Sách Thánh theo chu kỳ phụng vụ trong ngày.',
      verses: picked.r1Verses,
      suggestedQuotes: [picked.r1Quote],
    },
    psalm: {
      citation: picked.psCite,
      refrain: picked.psRefrain,
      stanzas: picked.psStanzas,
    },
    reading2: isSundayOrSolemnity
      ? {
          label: 'Bài đọc 2',
          citation: '1 Cr 13, 4-8a',
          title: 'Đức mến thì nhẫn nhục và hiền hậu',
          intro: 'Bài trích thư thứ nhất của thánh Phaolô Tông đồ gửi tín hữu Côrintô.',
          verses: [
            'Đức mến thì nhẫn nhục, hiền hậu, không ghen tương, không vênh vang, không tự đắc, không làm điều bất chính, không tìm tư lợi, không nóng giận, không nuôi hận thù.',
            'Đức mến tha thứ tất cả, tin tưởng tất cả, hy vọng tất cả, chịu đựng tất cả. Đức mến không bao giờ mất được.',
          ],
          suggestedQuotes: [
            {
              text: 'Đức mến thì nhẫn nhục, hiền hậu, tha thứ tất cả và không bao giờ mất được.',
              reference: '1 Cr 13, 4-8',
            },
          ],
        }
      : null,
    gospelAcclamation: 'Allêluia, Allêluia! Lạy Chúa, lời Chúa là thần khí và là sự sống; Chúa có những lời đem lại sự sống đời đời. Allêluia.',
    gospel: {
      label: 'Tin Mừng',
      citation: picked.gCite,
      title: picked.gTitle,
      intro: 'Tin Mừng Chúa Giêsu Kitô theo thánh Luca.',
      verses: picked.gVerses,
      suggestedQuotes: [picked.gQuote],
    },
    hymns: [
      {
        part: 'Ca nhập lễ',
        title: 'Bước Vào Đền Thánh',
        composer: 'Lm. Kim Long',
        lyricsExcerpt: 'Con tiến bước lên bàn thờ Chúa, là nguồn vui của tuổi xuân con...',
        liturgicalNote: `Phù hợp tâm tình phụng vụ ${feastTitle}.`,
      },
      {
        part: 'Ca dâng lễ',
        title: 'Của Lễ Ngày Sống',
        composer: 'Nguyễn Duy',
        lyricsExcerpt: 'Xin dâng lên Chúa tấm bánh thơm với chén rượu nồng, hòa cùng công việc sớm hôm...',
        liturgicalNote: 'Dâng lên Thiên Chúa những niềm vui và lo toan trong ngày.',
      },
      {
        part: 'Ca hiệp lễ',
        title: 'Ở Lại Trong Thầy',
        composer: 'Thánh Ca Phụng Vụ',
        lyricsExcerpt: 'Hãy ở lại trong tình yêu của Thầy, như cành nho gắn liền với thân nho...',
        liturgicalNote: 'Cảm nghiệm sự hiệp thông mật thiết với Chúa Giêsu Thánh Thể.',
      },
      {
        part: 'Ca kết lễ',
        title: 'Khúc Ca Tạ Ơn',
        composer: 'Phanxicô',
        lyricsExcerpt: 'Tạ ơn Chúa muôn đời vì tình thương Ngài, xin bước đi gieo rắc bình an...',
        liturgicalNote: 'Mang Lời Chúa vào các mối tương quan gia đình và công việc.',
      },
    ],
    examenQuestions: picked.questions,
  };
}

export function getLiturgicalDay(dateInput: Date | string): LiturgicalDay {
  const date = typeof dateInput === 'string' ? parseDateKey(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dow = date.getDay();
  const dateKey = formatDateKey(date);
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const easter = getEasterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const holyThursday = addDays(easter, -3);
  const pentecost = addDays(easter, 49);
  const advent1 = getFirstAdventSunday(year);
  const prevAdvent1 = getFirstAdventSunday(year - 1);
  const christTheKing = addDays(advent1, -7);
  const christmas = new Date(year, 11, 25);

  // Determine Liturgical Season & Base Color
  let season: LiturgicalSeason = 'Mùa Thường Niên';
  let seasonDetail = '';
  let color: LiturgicalColor = 'green';
  let rank: FeastRank = dow === 0 ? 'Chúa Nhật' : 'Ngày Thường';
  let feastTitle = dow === 0 ? 'Chúa Nhật Thường Niên' : `${WEEKDAYS_VI[dow]} Thường Niên`;

  const jan1 = new Date(year, 0, 1);
  const baptismOfLord = new Date(year, 0, 12); // approximate Baptism of Lord mid-Jan

  if ((date >= jan1 && date <= baptismOfLord) || date >= christmas) {
    season = 'Mùa Giáng Sinh';
    color = 'white';
    seasonDetail = 'Mừng Ngôi Lời Nhập Thể ở giữa nhân loại.';
  } else if (date >= ashWednesday && date < holyThursday) {
    season = 'Mùa Chay';
    const lentWeek = Math.floor(diffDays(date, ashWednesday) / 7) + 1;
    const laetare = addDays(easter, -21);
    color = sameDay(date, laetare) ? 'rose' : 'purple';
    seasonDetail = sameDay(date, palmSunday)
      ? 'Chúa Nhật Lễ Lá — Khai mạc Tuần Thánh'
      : `Tuần ${lentWeek} Mùa Chay — Sám hối, cầu nguyện và bác ái.`;
    if (sameDay(date, ashWednesday)) {
      feastTitle = 'Thứ Tư Lễ Tro';
      rank = 'Lễ Trọng';
    } else if (sameDay(date, palmSunday)) {
      feastTitle = 'Chúa Nhật Lễ Lá';
      rank = 'Chúa Nhật';
      color = 'red';
    }
  } else if (date >= holyThursday && date < easter) {
    season = 'Tam Nhật Thánh';
    color = diffDays(date, easter) === -2 ? 'red' : 'white';
    rank = 'Lễ Trọng';
    seasonDetail = 'Cuộc Thương Khó, Cái Chết và Sự Phục Sinh của Chúa Kitô.';
  } else if (date >= easter && date <= pentecost) {
    season = 'Mùa Phục Sinh';
    const easterWeek = Math.floor(diffDays(date, easter) / 7) + 1;
    color = sameDay(date, pentecost) ? 'red' : 'white';
    seasonDetail = sameDay(date, pentecost)
      ? 'Lễ Chúa Thánh Thần Hiện Xuống — Hoàn tất Mùa Phục Sinh'
      : `Tuần ${easterWeek} Phục Sinh — Alleluia, Chúa đã sống lại thật!`;
    if (sameDay(date, easter)) {
      feastTitle = 'Đại Lễ Chúa Nhật Phục Sinh';
      rank = 'Lễ Trọng';
    } else if (sameDay(date, pentecost)) {
      feastTitle = 'Lễ Chúa Thánh Thần Hiện Xuống';
      rank = 'Lễ Trọng';
    }
  } else if (date >= advent1 && date < christmas) {
    season = 'Mùa Vọng';
    const advWeek = Math.floor(diffDays(date, advent1) / 7) + 1;
    const gaudete = addDays(advent1, 14);
    color = sameDay(date, gaudete) ? 'rose' : 'purple';
    seasonDetail = sameDay(date, gaudete)
      ? 'Chúa Nhật III Mùa Vọng (Gaudete) — Hãy vui lên, Chúa đã gần đến!'
      : `Tuần ${advWeek} Mùa Vọng — Tỉnh thức và dọn đường đón Chúa.`;
    if (dow === 0) {
      feastTitle = `Chúa Nhật ${['I', 'II', 'III', 'IV'][advWeek - 1] || advWeek} Mùa Vọng`;
    } else {
      feastTitle = `${WEEKDAYS_VI[dow]} Tuần ${advWeek} Mùa Vọng`;
    }
  } else {
    season = 'Mùa Thường Niên';
    color = 'green';
    // Calculate Ordinary Time week (1-34)
    let otWeek = 1;
    if (date < ashWednesday) {
      otWeek = Math.max(1, Math.floor(diffDays(date, baptismOfLord) / 7) + 1);
    } else {
      const weeksBeforeAdvent = Math.floor(diffDays(advent1, date) / 7);
      otWeek = Math.max(1, Math.min(34, 34 - weeksBeforeAdvent));
    }
    const romanWeeks = [
      '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
      'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
      'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX',
      'XXXI', 'XXXII', 'XXXIII', 'XXXIV',
    ];
    const weekRoman = romanWeeks[otWeek] || String(otWeek);
    const liturgicalYearCycle = date >= prevAdvent1 && date < advent1 ? 'Năm C · Năm Chẵn (II)' : 'Năm A · Năm Lẻ (I)';
    seasonDetail = `Tuần ${weekRoman} Mùa Thường Niên (${liturgicalYearCycle})`;
    feastTitle = dow === 0 ? `Chúa Nhật ${weekRoman} Thường Niên` : `${WEEKDAYS_VI[dow]} Tuần ${weekRoman} Thường Niên`;
  }

  if (sameDay(date, christTheKing)) {
    feastTitle = 'Lễ Chúa Giêsu Kitô Vua Vũ Trụ';
    rank = 'Lễ Trọng';
    color = 'white';
    seasonDetail = 'Chúa Nhật XXXIV Thường Niên — Khép lại Năm Phụng Vụ.';
  }

  let saints: { name: string; role: string; biography: string }[] = [
    {
      name: 'Phụng vụ thường nhật trong năm',
      role: 'Lời Chúa & Giờ Kinh Thần Vụ',
      biography: 'Ngày sống bình dị được thánh hóa qua công việc, cầu nguyện và đức ái hằng ngày.',
    },
  ];

  const fixed = FIXED_FEASTS[mmdd];
  if (fixed) {
    feastTitle = fixed.title;
    rank = fixed.rank;
    // Sundays of Advent/Lent retain purple/rose unless Solemnity overrides, otherwise fixed feast color applies
    if (rank === 'Lễ Trọng' || rank === 'Lễ Kính' || rank === 'Lễ Nhớ' || season === 'Mùa Thường Niên') {
      color = fixed.color;
    }
    saints = fixed.saints;
  }

  const isSundayOrSolemnity = dow === 0 || rank === 'Lễ Trọng' || rank === 'Lễ Kính';
  const bundle =
    CURATED_BUNDLES[dateKey] ||
    generateWeekdayOrSeasonBundle(date, season, feastTitle, isSundayOrSolemnity);

  const liturgicalNotes: string[] = [];
  if (rank === 'Lễ Trọng') {
    liturgicalNotes.push('Đọc Kinh Vinh Danh (trừ Mùa Vọng và Mùa Chay) và Kinh Tin Kính.');
    liturgicalNotes.push('Thánh lễ gồm 3 bài đọc: Bài đọc 1, Đáp ca, Bài đọc 2 và Tin Mừng.');
  } else if (rank === 'Chúa Nhật') {
    liturgicalNotes.push('Thánh lễ Chúa Nhật có Bài đọc 1, Đáp ca, Bài đọc 2 và Tin Mừng; đọc Kinh Tin Kính.');
    if (season === 'Mùa Vọng' || season === 'Mùa Chay') {
      liturgicalNotes.push('Không đọc Kinh Vinh Danh trong Mùa Vọng và Mùa Chay.');
    } else {
      liturgicalNotes.push('Đọc Kinh Vinh Danh đầu Thánh lễ.');
    }
  } else if (rank === 'Lễ Kính') {
    liturgicalNotes.push('Đọc Kinh Vinh Danh; không đọc Kinh Tin Kính (trừ Chúa Nhật).');
  } else {
    liturgicalNotes.push('Thánh lễ ngày thường gồm Bài đọc 1, Đáp ca và Tin Mừng (không có Bài đọc 2).');
    liturgicalNotes.push('Áo lễ theo màu mùa phụng vụ hoặc màu trắng/đỏ nếu cử hành lễ nhớ các Thánh.');
  }

  const colorInfo = COLOR_META[color];
  const solarDateLabel = `${String(day).padStart(2, '0')} tháng ${String(month).padStart(2, '0')}, ${year}`;

  const keyVerse = bundle.gospel.suggestedQuotes[0]?.text || bundle.gospel.verses[0] || '';
  const gospelReflection = {
    theme: `${bundle.gospel.title} (${bundle.gospel.citation})`,
    paragraphs: [
      `Trong phụng vụ ${feastTitle}, đoạn Tin Mừng "${bundle.gospel.title}" mời gọi chúng ta dừng lại giữa nhịp sống bận rộn để lắng nghe tiếng Chúa Giêsu. Câu Lời Chúa cốt lõi hôm nay vang lên: "${keyVerse}"`,
      `Suy niệm Lời Chúa không chỉ dừng ở việc hiểu biết trí óc, nhưng là để Ánh Sáng Tin Mừng chạm vào chính hoàn cảnh cụ thể của gia đình, công việc và những mối tương quan bạn đang đối diện hôm nay trong ${season}.`,
    ],
    prayerPrompt: `Lạy Chúa Giêsu, qua bài Tin Mừng ${bundle.gospel.citation}, xin mở lòng con đón nhận Lời Ngài để biến suy tư hôm nay thành hành động yêu thương cụ thể.`,
  };

  return {
    dateKey,
    solarDateLabel,
    weekdayLabel: WEEKDAYS_VI[dow],
    season,
    seasonDetail,
    color,
    colorNameVi: colorInfo.nameVi,
    colorMeaning: colorInfo.meaning,
    rank,
    feastTitle,
    saints,
    liturgicalNotes,
    reading1: bundle.reading1,
    psalm: bundle.psalm,
    reading2: bundle.reading2,
    gospelAcclamation: bundle.gospelAcclamation,
    gospel: bundle.gospel,
    hymns: bundle.hymns,
    examenQuestions: bundle.examenQuestions,
    gospelReflection,
  };
}

export function getMonthCalendarDays(year: number, monthIndex0: number): LiturgicalDay[] {
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const list: LiturgicalDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    list.push(getLiturgicalDay(new Date(year, monthIndex0, d)));
  }
  return list;
}
