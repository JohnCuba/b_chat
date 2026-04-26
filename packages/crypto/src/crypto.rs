use aes_gcm::aead::{Aead, KeyInit, OsRng};
use aes_gcm::{Aes256Gcm, AeadCore, Nonce};
use hkdf::Hkdf;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use aes_gcm::aead::rand_core::RngCore;
use bip39::{Mnemonic, Language};

type HmacSha256 = Hmac<Sha256>;

/// Выводит 256 бит из seed через HKDF-SHA256 с заданным salt.
pub fn derive_bytes(seed: &str, salt: &str) -> [u8; 32] {
    let hk = Hkdf::<Sha256>::new(Some(salt.as_bytes()), seed.as_bytes());
    let mut okm = [0u8; 32];
    hk.expand(&[], &mut okm).expect("HKDF expand failed");
    okm
}

/// Детерминированно выводит идентификатор комнаты (64-символьная hex-строка).
pub fn derive_room_id(seed: &str) -> String {
    hex::encode(derive_bytes(seed, "room_id"))
}

/// Детерминированно выводит ключ аутентификации (64-символьная hex-строка).
pub fn derive_auth_key(seed: &str) -> String {
    hex::encode(derive_bytes(seed, "auth_key"))
}

/// Решает challenge: HMAC-SHA256(authKey, nonce).
pub fn solve_challenge(auth_key: &str, nonce: &str) -> Result<String, String> {
    let key_bytes = hex::decode(auth_key).map_err(|e| e.to_string())?;
    let mut mac =
        <HmacSha256 as Mac>::new_from_slice(&key_bytes).map_err(|e| e.to_string())?;
    mac.update(nonce.as_bytes());
    Ok(hex::encode(mac.finalize().into_bytes()))
}

/// Шифрует сообщение AES-256-GCM. Возвращает hex(IV ∥ ciphertext).
pub fn encrypt(seed: &str, plaintext: &str) -> Result<String, String> {
    let key_bytes = derive_bytes(seed, "enc_key");
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).map_err(|e| e.to_string())?;
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|e| e.to_string())?;

    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce);
    combined.extend_from_slice(&ciphertext);
    Ok(hex::encode(combined))
}

/// Дешифрует сообщение: извлекает IV (12 байт) и расшифровывает остаток.
pub fn decrypt(seed: &str, payload: &str) -> Result<String, String> {
    let raw = hex::decode(payload).map_err(|e| e.to_string())?;
    if raw.len() < 12 {
        return Err("payload too short".into());
    }

    let key_bytes = derive_bytes(seed, "enc_key");
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(&raw[..12]);
    let plaintext = cipher
        .decrypt(nonce, &raw[12..])
        .map_err(|e| e.to_string())?;

    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

pub fn gen_seed() -> String {
    let mut entropy = [0u8; 16];
    OsRng.fill_bytes(&mut entropy);
    Mnemonic::from_entropy_in(Language::English, &entropy)
        .expect("invalid entropy length")
        .to_string()
}