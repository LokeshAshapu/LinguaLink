# LinguaLink Core v0.1

> **Remove language barriers from human communication.**

LinguaLink Core v0.1 is a production-oriented prototype for a real-time multilingual voice communication platform. It enables two users speaking different languages (such as Telugu and Hindi) to have a voice conversation where each participant hears the other in their preferred language with live translated captions and sub-second target conversational latency.

---

## Repository Structure

```
lingualink/
├── apps/
│   └── mobile/                # React Native Mobile Client
├── services/
│   └── api/                   # NestJS Modular Monolith API Backend
├── packages/
│   ├── types/                 # Shared TypeScript Models & Interfaces
│   ├── config/                # Shared Language & System Configuration
│   └── realtime-events/       # Shared WebSockets & Signaling Events
├── docs/
│   └── architecture/          # High-Level Architecture & Technical Blueprint
├── docker-compose.yml         # PostgreSQL, Redis & LiveKit Infrastructure
├── .env.example               # Environment Variables Template
└── Makefile                   # Command-line workflows
```

---

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### 1. Setup Environment
```bash
make setup
```

### 2. Launch Local Infrastructure
```bash
make docker-up
```

### 3. Start Backend API
```bash
make dev
```

---

## License

Private & Confidential — LinguaLink Inc.
