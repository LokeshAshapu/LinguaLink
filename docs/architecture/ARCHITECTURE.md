# LinguaLink Core v0.1 — Architecture & Technical Blueprint

## 1. High-Level System Architecture (HLD)

LinguaLink Core is designed as a **Modular Monolith** optimized for low-latency, real-time voice translation between two users speaking different languages (e.g. Telugu ↔ Hindi).

```
 +-----------------------------------------------------------------------+
 |                         MOBILE CLIENT (React Native)                  |
 |  - Audio Stream / WebRTC                                              |
 |  - Dual Live Captions UI                                              |
 |  - Call State Controller & Language Overrides                        |
 +-------------------+-------------------------------+-------------------+
                     | WebRTC Audio Stream           | Signaling WSS
                     v                               v
 +-------------------+-------------------------------+-------------------+
 |                   LIVEKIT MEDIA SERVER / WEBRTC                   |
 |  - SFU Audio Routing                                                  |
 |  - Audio Chunk Extraction / Subscriptions                             |
 +-----------------------------------+-----------------------------------+
                                     | Raw Audio Frames
                                     v
 +-----------------------------------+-----------------------------------+
 |                   LINGUALINK CORE BACKEND (NestJS API)                |
 |                                                                       |
 |   [Signaling Gateway] ---> [Conversation Intelligence Engine]        |
 |                                     |                                 |
 |                                     v                                 |
 |                              [AI GATEWAY]                             |
 |                +--------------------+-------------------+             |
 |                |                    |                   |             |
 |                v                    v                   v             |
 |         [STT Provider]   [Translation Provider]   [TTS Provider]      |
 |          (Whisper/DG)        (OpenAI/Azure)        (ElevenLabs)       |
 |                                                                       |
 |   [Privacy & Scrubbing]   [Audit Logging]   [PostgreSQL / Redis]       |
 +-----------------------------------------------------------------------+
```

---

## 2. Real-Time Streaming AI Pipeline

```
Microphone Audio Frames
        │
        ▼
Voice Activity Detection (VAD)
        │
        ▼
Streaming Speech-to-Text (STT) ---> Interim Transcript & Confidence
        │
        ▼
Language Detection Verification (Confidence Check)
        │
        ▼
Call-Scoped Conversation Context Engine (Rolling Short-Term Memory)
        │
        ▼
Streaming Translation Engine (Source Lang → Target Lang)
        │
        ▼
Streaming Text-to-Speech (TTS) ---> Audio Chunk Stream
        │
        ▼
Receiver Audio Playback & Live Captions Display
```

---

## 3. WebRTC Call Signaling Flow

```
Caller                           Backend / Signaling                        Receiver
  │                                       │                                     │
  ├────── Initiate Call (Payload) ───────>│                                     │
  │                                       ├────── Incoming Call Notification ──>│
  │                                       │<───── Accept Call ──────────────────┤
  │<───── LiveKit Room Token ─────────────┤                                     │
  │                                       ├────── LiveKit Room Token ──────────>│
  │                                       │                                     │
  ├─── Connect WebRTC Audio Stream ──────>│<──── Connect WebRTC Audio Stream ───┤
  │                                       │                                     │
  ├─── User A Speaks (Telugu) ───────────>│                                     │
  │                                       ├── STT (Telugu)                      │
  │                                       ├── Translate (Telugu → Hindi)        │
  │                                       ├── TTS (Hindi)                       │
  │<── Dual Caption (Telugu/Hindi) ───────┼── Broadcast Dual Caption ──────────>│
  │                                       ├── Stream Hindi Audio Chunk ────────>│
```

---

## 4. Latency Budget Breakdown

| Processing Stage | Target Latency | Notes / Optimization Strategy |
| :--- | :--- | :--- |
| **Audio Capture & VAD** | ~50 ms | Local frame chunking (20ms frames) |
| **Network Upload** | ~40 ms | WebRTC UDP transmission |
| **Streaming STT** | ~300 ms | Deepgram/Whisper streaming sockets |
| **Translation Engine** | ~150 ms | Contextual fast translation pipeline |
| **Streaming TTS (First Byte)** | ~250 ms | ElevenLabs / Azure chunk streaming |
| **Network Delivery** | ~40 ms | Real-time audio streaming delivery |
| **Buffer & Playback** | ~50 ms | Receiver playback buffer |
| **Total End-to-End Latency** | **~880 ms (Sub-second)** | Target design boundary |

---

## 5. Security & Privacy Architecture

- **Zero Permanent Audio Retention**: Raw call audio buffers are deleted immediately after STT transformation.
- **Ephemeral Conversation Context**: Context windows exist strictly in-memory during active calls and are destroyed immediately when the call status changes to `ENDED`.
- **PII Protection**: Audit logs capture metadata and latency timings; transcript contents and raw audio are never written to disk or logs.
- **JWT & Argon2 Security**: All WebSocket connections and HTTP endpoints require valid JWT authentication.
