/**
 * Криптографический модуль чата.
 *
 * Из единой seed-фразы через HKDF выводятся три независимых ключа:
 *  - chatId  (идентификатор чата)
 *  - authKey (ключ для challenge-response аутентификации)
 *  - encKey  (ключ AES-256-GCM для шифрования сообщений)
 *
 * Сервер никогда не получает seed-фразу и не может расшифровать сообщения.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const KEY_DERIVE_ALGO = 'HKDF';
const HASH_ALGO = 'SHA-256';
const ENCRYPTION_MODE = 'AES-GCM';

// ─── Утилиты для конвертации между ArrayBuffer и hex-строкой ───

const bufToHex = (buf: ArrayBuffer): string =>
  [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

const hexToBuf = (hex: string): ArrayBuffer =>
  new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16))).buffer;

// ─── Деривация ключей (HKDF) ───

/**
 * Импортирует seed-фразу как базовый ключ HKDF.
 * Из него далее выводятся все производные ключи.
 */
const deriveHkdfBase = (seed: string) =>
  crypto.subtle.importKey('raw', encoder.encode(seed), KEY_DERIVE_ALGO, false, ['deriveBits', 'deriveKey']);

/**
 * Выводит 256-битное значение из seed-фразы с заданным salt.
 * Разные salt дают разные, криптографически независимые ключи.
 */
const deriveHex = async (seed: string, salt: string): Promise<string> => {
  const baseKey = await deriveHkdfBase(seed);
  const bits = await crypto.subtle.deriveBits(
    { name: KEY_DERIVE_ALGO, hash: HASH_ALGO, salt: encoder.encode(salt), info: new Uint8Array() },
    baseKey,
    256
  );
  return bufToHex(bits);
};

/**
 * Выводит CryptoKey для AES-256-GCM шифрования/дешифрования.
 * Использует фиксированный salt 'enc_key', отличный от chatId и authKey.
 */
const deriveEncryptionKey = async (seed: string): Promise<CryptoKey> => {
  const baseKey = await deriveHkdfBase(seed);
  return crypto.subtle.deriveKey(
    { name: KEY_DERIVE_ALGO, hash: HASH_ALGO, salt: encoder.encode('enc_key'), info: new Uint8Array() },
    baseKey,
    { name: ENCRYPTION_MODE, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// ─── Публичные функции ───

/** Детерминированно выводит идентификатор комнаты (64-символьная hex-строка) из seed-фразы. */
export const deriveChatId = (seed: string) => deriveHex(seed, 'chat_id');

/** Детерминированно выводит ключ аутентификации (64-символьная hex-строка) из seed-фразы. */
export const deriveAuthKey = (seed: string) => deriveHex(seed, 'auth_key');

/**
 * Решает challenge от сервера: подписывает nonce через HMAC-SHA256 с authKey.
 * Сервер проверяет подпись timing-safe сравнением, подтверждая знание seed-фразы.
 */
export const solveChallenge = async (authKey: string, nonce: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBuf(authKey),
    { name: 'HMAC', hash: HASH_ALGO },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(nonce));
  return bufToHex(signature);
};

/**
 * Шифрует сообщение алгоритмом AES-256-GCM.
 * Каждый вызов генерирует случайный IV (12 байт), поэтому одинаковые
 * сообщения дают разный шифротекст.
 * @returns hex-строка формата: IV (12 байт) + ciphertext
 */
export const encrypt = async (seed: string, plaintext: string): Promise<string> => {
  const key = await deriveEncryptionKey(seed);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: ENCRYPTION_MODE, iv },
    key,
    encoder.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bufToHex(combined.buffer);
};

/**
 * Дешифрует сообщение: извлекает IV из первых 12 байт payload,
 * остаток — шифротекст. Возвращает исходный текст.
 */
export const decrypt = async (seed: string, payload: string): Promise<string> => {
  const key = await deriveEncryptionKey(seed);
  const raw = new Uint8Array(hexToBuf(payload));
  const iv = raw.slice(0, 12);
  const ciphertext = raw.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: ENCRYPTION_MODE, iv },
    key,
    ciphertext
  );
  return decoder.decode(plaintext);
};
