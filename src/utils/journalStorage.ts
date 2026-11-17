import type {
  DailyLivingEntry,
  EncryptedVaultPayload,
  GmailAccountMeta,
} from '../types/catholic';

const ENTRIES_STORAGE_KEY = 'hiepthong_daily_living_entries_v1';
const PIN_HASH_KEY = 'hiepthong_journal_pin_hash_v1';
const AUTO_LOCK_KEY = 'hiepthong_journal_autolock_v1';

const ACCOUNTS_KEY = 'hiepthong_gmail_accounts_v1';
const ACTIVE_ACCOUNT_EMAIL_KEY = 'hiepthong_active_gmail_v1';
const VAULT_PREFIX = 'hiepthong_vault_v1_';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function createEmptyEntry(dateKey: string): DailyLivingEntry {
  return {
    dateKey,
    morningOfferingDone: false,
    chosenQuote: null,
    resolutionCategory: 'Bố thí & Bác ái',
    resolutionText: '',
    resolutionCompleted: false,
    examenResponses: {},
    gospelReflectionNote: '',
    journalNote: '',
    updatedAt: new Date().toISOString(),
  };
}

// Guest (non-logged-in) local storage helpers
export function loadAllEntries(): Record<string, DailyLivingEntry> {
  try {
    const raw = localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function loadEntryForDate(dateKey: string): DailyLivingEntry {
  const all = loadAllEntries();
  if (all[dateKey]) return all[dateKey];
  return createEmptyEntry(dateKey);
}

export function saveEntryForDate(entry: DailyLivingEntry): Record<string, DailyLivingEntry> {
  const all = loadAllEntries();
  const next = {
    ...all,
    [entry.dateKey]: {
      ...entry,
      updatedAt: new Date().toISOString(),
    },
  };
  try {
    localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors cleanly
  }
  return next;
}

// Legacy PIN helpers
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`hiep-thong-salt:${pin}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function hasPinConfigured(): boolean {
  try {
    return Boolean(localStorage.getItem(PIN_HASH_KEY));
  } catch {
    return false;
  }
}

export async function setJournalPin(pin: string): Promise<void> {
  const hashed = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hashed);
  localStorage.setItem(AUTO_LOCK_KEY, '1');
}

export function clearJournalPin(): void {
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(AUTO_LOCK_KEY);
}

export async function verifyJournalPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_HASH_KEY);
  if (!stored) return true;
  const candidate = await hashPin(pin);
  return candidate === stored;
}

// Per-Gmail AES-256-GCM Encryption & Isolated Accounts
export function normalizeGmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidGmailAddress(email: string): boolean {
  const normalized = normalizeGmail(email);
  return /^[^\s@]+@gmail\.com$/.test(normalized);
}

export async function hashEmailId(email: string): Promise<string> {
  const normalized = normalizeGmail(email);
  const data = new TextEncoder().encode(`hiepthong-gmail-id:${normalized}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24);
}

async function deriveAesKeyAndVerifier(
  email: string,
  password: string,
  saltBytes: Uint8Array
): Promise<{ aesKey: CryptoKey; verifierHash: string }> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`${normalizeGmail(email)}::${password}`),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Create a clean ArrayBuffer copy of saltBytes for strict WebCrypto compatibility
  const saltBuffer = new Uint8Array(saltBytes).buffer;

  // Derive 256-bit AES-GCM key
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // Derive separate verifier bits for password checking without storing password or AES key
  const verifierBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(`verifier:${bytesToBase64(saltBytes)}`),
      iterations: 60000,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  const verifierHash = Array.from(new Uint8Array(verifierBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { aesKey, verifierHash };
}

export function listGmailAccounts(): GmailAccountMeta[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGmailAccounts(accounts: GmailAccountMeta[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getActiveGmailEmail(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ACCOUNT_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function setActiveGmailEmail(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(ACTIVE_ACCOUNT_EMAIL_KEY, normalizeGmail(email));
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_EMAIL_KEY);
    }
  } catch {
    // ignore
  }
}

export function findGmailAccount(email: string): GmailAccountMeta | null {
  const normalized = normalizeGmail(email);
  return listGmailAccounts().find((acc) => acc.email === normalized) || null;
}

export async function registerGmailAccount(
  email: string,
  password: string,
  displayName?: string
): Promise<{ account: GmailAccountMeta; aesKey: CryptoKey; entries: Record<string, DailyLivingEntry> }> {
  const normalized = normalizeGmail(email);
  if (!isValidGmailAddress(normalized)) {
    throw new Error('Vui lòng sử dụng địa chỉ @gmail.com hợp lệ.');
  }
  if (password.length < 6) {
    throw new Error('Mật khẩu mã hóa cần tối thiểu 6 ký tự.');
  }
  if (findGmailAccount(normalized)) {
    throw new Error('Gmail này đã có tài khoản. Vui lòng chọn tab Đăng nhập.');
  }

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const emailHash = await hashEmailId(normalized);
  const { aesKey, verifierHash } = await deriveAesKeyAndVerifier(normalized, password, saltBytes);

  const account: GmailAccountMeta = {
    email: normalized,
    emailHash,
    displayName: (displayName || normalized.split('@')[0]).trim(),
    saltBase64: bytesToBase64(saltBytes),
    verifierHash,
    createdAt: new Date().toISOString(),
  };

  const accounts = listGmailAccounts();
  saveGmailAccounts([...accounts, account]);
  setActiveGmailEmail(normalized);

  const initialEntries: Record<string, DailyLivingEntry> = {};
  await saveEncryptedVault(emailHash, initialEntries, aesKey);

  return { account, aesKey, entries: initialEntries };
}

export async function loginGmailAccount(
  email: string,
  password: string
): Promise<{ account: GmailAccountMeta; aesKey: CryptoKey; entries: Record<string, DailyLivingEntry> }> {
  const normalized = normalizeGmail(email);
  const account = findGmailAccount(normalized);
  if (!account) {
    throw new Error('Chưa tìm thấy tài khoản cho Gmail này. Hãy chuyển sang Tạo tài khoản mới.');
  }

  const saltBytes = base64ToBytes(account.saltBase64);
  const { aesKey, verifierHash } = await deriveAesKeyAndVerifier(normalized, password, saltBytes);

  if (verifierHash !== account.verifierHash) {
    throw new Error('Mật khẩu giải mã không chính xác.');
  }

  const entries = await loadEncryptedVault(account.emailHash, aesKey);
  setActiveGmailEmail(normalized);

  return { account, aesKey, entries };
}

export async function saveEncryptedVault(
  emailHash: string,
  entries: Record<string, DailyLivingEntry>,
  aesKey: CryptoKey
): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(entries));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv).buffer },
    aesKey,
    plaintext
  );

  const payload: EncryptedVaultPayload = {
    ivBase64: bytesToBase64(iv),
    cipherBase64: bytesToBase64(new Uint8Array(cipherBuffer)),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(`${VAULT_PREFIX}${emailHash}`, JSON.stringify(payload));
}

export async function loadEncryptedVault(
  emailHash: string,
  aesKey: CryptoKey
): Promise<Record<string, DailyLivingEntry>> {
  const raw = localStorage.getItem(`${VAULT_PREFIX}${emailHash}`);
  if (!raw) return {};

  try {
    const payload = JSON.parse(raw) as EncryptedVaultPayload;
    const iv = base64ToBytes(payload.ivBase64);
    const cipherBytes = base64ToBytes(payload.cipherBase64);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv).buffer },
      aesKey,
      new Uint8Array(cipherBytes).buffer
    );

    const json = new TextDecoder().decode(decryptedBuffer);
    const parsed = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    throw new Error('Không thể giải mã dữ liệu Hồi tâm với khóa hiện tại.');
  }
}
