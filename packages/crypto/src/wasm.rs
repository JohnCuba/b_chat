use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = "deriveRoomId")]
pub fn wasm_derive_room_id(seed: &str) -> String {
    crate::utils::set_panic_hook();
    crate::crypto::derive_room_id(seed)
}

#[wasm_bindgen(js_name = "deriveAuthKey")]
pub fn wasm_derive_auth_key(seed: &str) -> String {
    crate::utils::set_panic_hook();
    crate::crypto::derive_auth_key(seed)
}

#[wasm_bindgen(js_name = "solveChallenge")]
pub fn wasm_solve_challenge(auth_key: &str, nonce: &str) -> Result<String, JsError> {
    crate::crypto::solve_challenge(auth_key, nonce).map_err(|e| JsError::new(&e))
}

#[wasm_bindgen]
pub fn encrypt(seed: &str, plaintext: &str) -> Result<String, JsError> {
    crate::crypto::encrypt(seed, plaintext).map_err(|e| JsError::new(&e))
}

#[wasm_bindgen]
pub fn decrypt(seed: &str, payload: &str) -> Result<String, JsError> {
    crate::crypto::decrypt(seed, payload).map_err(|e| JsError::new(&e))
}

#[wasm_bindgen(js_name = "genSeed")]
pub fn gen_seed() -> String {
    crate::crypto::gen_seed()
}