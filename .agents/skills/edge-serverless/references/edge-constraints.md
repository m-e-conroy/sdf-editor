# Edge Runtime (WinterCG) Constraints & Best Practices

| Feature | Support | Alternative / Note |
| :--- | :--- | :--- |
| `fs` (File System) | 🛑 No | Use Cloudflare R2, AWS S3, or DB blobs. |
| `crypto` (Node) | 🛑 Limited | Use `globalThis.crypto` (Web Crypto API). |
| `process.env` | 🛑 Limited | Platforms inject env via `env` object in handler. |
| TCP Connections | 🛑 Limited | Use HTTP-based DB drivers (Neon, Turso). |
| Execution Time | 🛑 Strict | Usually <30s (Cloudflare free: 10ms CPU). |
| Memory | 🛑 Low | Usually 128MB per isolate. |
| Dynamic `eval` | 🛑 No | Security restriction in most V8 isolates. |

## Supported Web APIs
- `fetch`, `Headers`, `Request`, `Response`
- `URL`, `URLSearchParams`
- `TextEncoder`, `TextDecoder`
- `ReadableStream`, `WritableStream`
- `atob`, `btoa`
- `EventTarget`, `CustomEvent`

## Framework Recommendation: Hono
Hono is the standard for Edge. It has zero dependencies and uses standard Web APIs.
```javascript
import { Hono } from 'hono'
const app = new Hono()
app.get('/', (c) => c.text('Hono on Edge!'))
export default app
```
