# b_chat

Приватный мессенджер с end-to-end шифрованием. Комнаты создаются из seed-фразы — никакой регистрации, сервер никогда не видит открытый текст.

## Стек

- **Backend:** Bun + Elysia + WebSocket
- **Frontend:** Preact + Preact Signals + Tailwind/DaisyUI
- **Криптография:** HKDF (SHA-256), HMAC-SHA256, AES-256-GCM, BIP39

## Как это работает

```mermaid
sequenceDiagram
    participant Alice as Alice (Создатель)
    participant BrowserA as Браузер Alice
    participant Server as Elysia Server
    participant BrowserB as Браузер Bob
    participant Bob as Bob (Участник)

    Note over Alice,Bob: 1. Создание комнаты

    Alice->>BrowserA: Вводит имя + генерирует seed-фразу
    BrowserA->>BrowserA: HKDF(seed, "room_id") → roomId
    BrowserA->>BrowserA: HKDF(seed, "auth_key") → authKey
    BrowserA->>Server: POST /api/room { roomId, authKey }
    Server->>Server: Сохраняет Room { authKey, connections }
    Server-->>BrowserA: { ok: true }
    BrowserA->>BrowserA: Redirect → /chat?id={roomId}

    Note over Alice,Bob: 2. Подключение Alice по WebSocket

    BrowserA->>Server: WS /api/chat?id={roomId}
    Server->>Server: Генерирует nonce (32 байта)
    Server-->>BrowserA: { type: "challenge", nonce }
    BrowserA->>BrowserA: proof = HMAC-SHA256(authKey, nonce)
    BrowserA->>Server: { type: "challenge_response", proof }
    Server->>Server: Timing-safe сравнение proof
    Server-->>BrowserA: { type: "authenticated" }
    Note over BrowserA: Соединение установлено ✓

    Note over Alice,Bob: 3. Bob присоединяется (та же seed-фраза)

    Bob->>BrowserB: Вводит имя + вставляет seed-фразу
    BrowserB->>BrowserB: HKDF(seed, "room_id") → тот же roomId
    BrowserB->>BrowserB: Redirect → /chat?id={roomId}
    BrowserB->>Server: WS /api/chat?id={roomId}
    Server-->>BrowserB: { type: "challenge", nonce }
    BrowserB->>BrowserB: proof = HMAC-SHA256(authKey, nonce)
    BrowserB->>Server: { type: "challenge_response", proof }
    Server->>Server: Timing-safe сравнение proof
    Server-->>BrowserB: { type: "authenticated" }
    Note over BrowserB: Соединение установлено ✓

    Note over Alice,Bob: 4. Обмен сообщениями (E2E шифрование)

    Alice->>BrowserA: Пишет "Привет!"
    BrowserA->>BrowserA: AES-256-GCM encrypt(seed, "Привет!")
    BrowserA->>Server: { type: "message", name: "Alice", text: encrypted }
    Server->>BrowserB: Broadcast → { type: "message", name: "Alice", text: encrypted, ts }
    BrowserB->>BrowserB: AES-256-GCM decrypt(seed, encrypted)
    BrowserB->>Bob: Показывает "Alice: Привет!"

    Bob->>BrowserB: Пишет "Здравствуй!"
    BrowserB->>BrowserB: AES-256-GCM encrypt(seed, "Здравствуй!")
    BrowserB->>Server: { type: "message", name: "Bob", text: encrypted }
    Server->>BrowserA: Broadcast → { type: "message", name: "Bob", text: encrypted, ts }
    BrowserA->>BrowserA: AES-256-GCM decrypt(seed, encrypted)
    BrowserA->>Alice: Показывает "Bob: Здравствуй!"

    Note over Alice,Bob: 5. Отключение и очистка

    Alice->>BrowserA: Закрывает вкладку
    BrowserA->>Server: WS close
    Server->>Server: Удаляет connection Alice
    Bob->>BrowserB: Закрывает вкладку
    BrowserB->>Server: WS close
    Server->>Server: Комната пуста → удаляет Room
```