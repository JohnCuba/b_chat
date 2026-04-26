use crypto_v2::*;

#[test]
fn room_id_is_deterministic() {
    let a = derive_room_id("test seed");
    let b = derive_room_id("test seed");
    assert_eq!(a, b);
    assert_eq!(a.len(), 64);
}

#[test]
fn auth_key_differs_from_room_id() {
    let room = derive_room_id("test seed");
    let auth = derive_auth_key("test seed");
    assert_ne!(room, auth);
}

#[test]
fn challenge_response_works() {
    let auth_key = derive_auth_key("test seed");
    let proof = solve_challenge(&auth_key, "nonce123").unwrap();
    assert_eq!(proof.len(), 64);

    let proof2 = solve_challenge(&auth_key, "nonce123").unwrap();
    assert_eq!(proof, proof2);
}

#[test]
fn encrypt_decrypt_roundtrip() {
    let seed = "my secret seed";
    let message = "Hello, world!";
    let encrypted = encrypt(seed, message).unwrap();
    let decrypted = decrypt(seed, &encrypted).unwrap();
    assert_eq!(decrypted, message);
}

#[test]
fn different_iv_each_time() {
    let a = encrypt("seed", "same text").unwrap();
    let b = encrypt("seed", "same text").unwrap();
    assert_ne!(a, b);
}
