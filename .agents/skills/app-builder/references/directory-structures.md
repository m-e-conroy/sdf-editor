# Standard Directory Structures

## Next.js Full-Stack
```text
src/
├── app/              # Routes & Layouts
├── components/       # UI (ui, layout, shared)
├── styles/           # Global CSS & Tokens
├── lib/              # DB (Prisma) & Utils
├── hooks/            # Custom hooks
├── services/         # Data fetching
├── types/            # TS interfaces
└── assets/           # Local assets
```

## NestJS API
```text
src/
├── modules/          # Feature modules (auth, users)
├── common/           # Utils, guards, interceptors
├── core/             # Business logic
├── infra/            # DB, External APIs
└── config/           # Config
```

## Expo Mobile
```text
src/
├── app/              # Expo Router
├── components/       # UI
├── hooks/            # Shared logic
├── services/         # API clients
├── store/            # State (Zustand)
└── utils/            # Helpers
```
