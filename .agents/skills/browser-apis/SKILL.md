---
name: browser-apis
description: Comprehensive Browser APIs for storage, PWA, media, hardware, navigation, and security. Includes Service Workers, IndexedDB, WebAuthn, WebRTC, and modern UI observers. Triggers: "browser api", "indexeddb", "service worker", "webauthn", "webrtc", "canvas api", "file system access", "navigation api".
version: 1.1.0
---

# Browser APIs Skill

Use native browser capabilities for offline-ready, high-performance, and secure apps.

## When to Use

Trigger when:
- Client-side storage and offline data (IndexedDB, PWA).
- Real-time media/graphics (Canvas, Web Audio, Media Capture).
- Hardware access (Bluetooth, Geolocation, Sensors).
- Advanced routing and navigation (Navigation API, Speculation Rules).
- Secure identity and payments (WebAuthn, Payment Request).
- Direct file system interaction.

## Instructions

### 1. Storage & Offline
- **IndexedDB**: Asynchronous, high-capacity structured storage. Use `idb` library.
- **Service Workers**: Intercept network requests.
    - `Stale-While-Revalidate`: Immediate UI rendering + background fetch.
    - `Cache First`: Cache static assets.
- **File System Access**: `window.showOpenFilePicker()`. Direct read/write to local files.

### 2. Media & Real-time
- **Canvas API**: `getContext('2d')` or `WebGL`. High-performance graphics.
- **Web Audio**: `AudioContext` for spatial sound and synthesis.
- **WebRTC / WebTransport**: Peer-to-peer or low-latency server connectivity.
- **Streams API**: Handle large data flows without memory spikes.

### 3. Hardware & Sensors
- **Geolocation**: `navigator.geolocation`.
- **Web Bluetooth/USB**: Direct peripheral communication.
- **Sensor APIs**: `Accelerometer`, `Gyroscope`. Native device motion.
- **Gamepad API**: Physical controller support.

### 4. Navigation & UI
- **Navigation API**: Modern routing. `navigation.navigate()`.
- **Speculation Rules**: `<script type="speculationrules">` for instant pre-rendering.
- **IntersectionObserver**: Lazy-load, infinite scroll.
- **View Transitions**: `document.startViewTransition()` for fluid UI state transitions.
- **Popover API**: Declarative tooltips and menus.

### 5. Security & Identity
- **WebAuthn**: Passwordless biometrics (FaceID/Fingerprint).
- **Trusted Types**: Protect against XSS in dangerous HTML sinks.
- **Web Crypto**: `crypto.subtle`. Hashing (SHA), Encryption (AES).
- **Credential Management**: Browser-mediated sign-in flows.

### 6. Performance
- **Scheduling API**: `scheduler.postTask()`. Yield to main thread.
- **PerformanceObserver**: Real-time CWV metrics (LCP, INP).
- **Reporting API**: Monitor CSP violations and deprecations.

## Output Format

```markdown
### Browser API Spec: {Feature}

**1. Primary APIs**
- List APIs (e.g. WebAuthn + Web Crypto).

**2. Core Logic**
- Async flow, permissions check, event handling.

**3. Performance & Security**
- Yielding strategy, encryption, XSS protection.

**4. Fallback**
- Support check: `'API' in window`.
```

## Related Skills

- **[frontend-developer](../agents/frontend-developer.md)**: UI implementation.
- **[core-web-vitals](../core-web-vitals/SKILL.md)**: Performance monitoring.
- **[auth-patterns](../auth-patterns/SKILL.md)**: Using WebAuthn/Crypto for auth.
