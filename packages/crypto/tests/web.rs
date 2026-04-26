#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;
use crypto_v2::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn room_id_deterministic() {
    let a = derive_room_id("test seed");
    let b = derive_room_id("test seed");
    assert_eq!(a, b);
    assert_eq!(a.len(), 64);
}

#[wasm_bindgen_test]
fn encrypt_decrypt_roundtrip() {
    let encrypted = encrypt("seed", "hello").unwrap();
    let decrypted = decrypt("seed", &encrypted).unwrap();
    assert_eq!(decrypted, "hello");
}
