// ========================================================================
// SDF Studio 3D - In-Browser Agent WebSocket Bridge (Task 2.1)
// Connects SDF Studio 3D to local MCP Server & Hub with heartbeat,
// token auth, session parking, and auto-reconnect backoff.
// ========================================================================

import {
  PROTOCOL_VERSION,
  createHelloEnvelope,
  type HelloEnvelope,
  type WelcomeEnvelope,
  type RequestEnvelope,
  type ProgressEnvelope,
  type ResponseEnvelope,
  type BridgeEnvelope
} from '../../shared/protocol/envelope';

export type BridgeStatus = 'off' | 'listening' | 'connected' | 'parked';

export interface AgentBridgeOptions {
  url?: string;
  token?: string;
  autoConnect?: boolean;
  appVersion?: string;
  capabilities?: string[];
  pingIntervalMs?: number;
  heartbeatTimeoutMs?: number;
}

export class AgentBridge extends EventTarget {
  private static instance: AgentBridge | null = null;

  public status: BridgeStatus = 'off';
  public sessionId: string | null = null;
  public url: string;
  public token: string | null = null;

  private ws: WebSocket | null = null;
  private appVersion: string;
  private capabilities: string[];

  // Heartbeat & Watchdog
  private pingIntervalMs: number;
  private heartbeatTimeoutMs: number;
  private pingTimer: any = null;
  private watchdogTimer: any = null;
  private lastMessageTimestamp: number = 0;

  // Exponential Backoff Reconnection
  private reconnectTimer: any = null;
  private reconnectAttempt: number = 0;
  private readonly backoffDelays = [500, 1000, 2000, 5000];
  private isExplicitlyClosed: boolean = false;

  constructor(options: AgentBridgeOptions = {}) {
    super();
    this.url = options.url || 'ws://127.0.0.1:8765';
    this.appVersion = options.appVersion || '1.10.0';
    this.capabilities = options.capabilities || ['groups', 'snapshot', 'queries'];
    this.pingIntervalMs = options.pingIntervalMs ?? 5000;
    this.heartbeatTimeoutMs = options.heartbeatTimeoutMs ?? 15000;

    // Resolve pairing token
    this.token = this.resolveToken(options.token);

    if (options.autoConnect) {
      this.connect();
    }
  }

  public static getInstance(options?: AgentBridgeOptions): AgentBridge {
    if (!AgentBridge.instance) {
      AgentBridge.instance = new AgentBridge(options);
    }
    return AgentBridge.instance;
  }

  /**
   * Resolves token from:
   * 1. Explicit parameter
   * 2. URL hash `#bridge=<token>`
   * 3. localStorage `sdf_studio_bridge_token`
   */
  public resolveToken(explicitToken?: string): string | null {
    if (explicitToken && explicitToken.trim()) {
      const trimmed = explicitToken.trim();
      this.saveToken(trimmed);
      return trimmed;
    }

    // Try reading from URL hash: #bridge=xyz
    if (typeof window !== 'undefined' && window.location?.hash) {
      const match = window.location.hash.match(/[#&]bridge=([a-zA-Z0-9_\-]+)/);
      if (match && match[1]) {
        const hashToken = match[1];
        this.saveToken(hashToken);
        return hashToken;
      }
    }

    // Try reading from localStorage
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('sdf_studio_bridge_token');
      if (stored && stored.trim()) {
        return stored.trim();
      }
    }

    // Fallback to default zero-friction local pairing token
    return 'sdf-studio-bridge';
  }

  public saveToken(token: string): void {
    this.token = token;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sdf_studio_bridge_token', token);
      }
    } catch {
      // Ignore localStorage write failures in sandboxed/iframe contexts
    }
  }

  public clearToken(): void {
    this.token = null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('sdf_studio_bridge_token');
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Opens WebSocket connection to MCP Agent Hub.
   */
  public connect(url?: string, token?: string): void {
    if (url) this.url = url;
    if (token) this.saveToken(token);

    this.isExplicitlyClosed = false;
    this.clearTimers();

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // Ignore
      }
      this.ws = null;
    }

    this.setStatus('listening');

    try {
      this.ws = new WebSocket(this.url);
    } catch (err) {
      this.emitError(new Error(`WebSocket connection creation failed: ${err}`));
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onerror = (event) => this.handleError(event);
    this.ws.onclose = (event) => this.handleClose(event);
  }

  /**
   * Closes connection and turns bridge off (stops auto-reconnect).
   */
  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.clearTimers();

    if (this.ws) {
      try {
        this.ws.close(1000, 'Client requested disconnect');
      } catch {
        // Ignore
      }
      this.ws = null;
    }

    this.sessionId = null;
    this.setStatus('off');
  }

  /**
   * Sends Takeover message if session is parked.
   */
  public takeControl(): void {
    if (this.status !== 'parked') return;
    const effectiveToken = this.token || 'anonymous_studio';
    const hello: HelloEnvelope = createHelloEnvelope(
      'studio',
      effectiveToken,
      this.appVersion,
      this.capabilities
    );
    this.send(hello);
  }

  /**
   * Sends a response envelope back to the MCP hub.
   */
  public sendResponse(response: ResponseEnvelope): void {
    this.send(response);
  }

  /**
   * Sends a streaming progress notification back to the MCP hub.
   */
  public sendProgress(progress: ProgressEnvelope): void {
    this.send(progress);
  }

  private send(data: object): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    try {
      this.ws.send(JSON.stringify(data));
    } catch (err) {
      this.emitError(new Error(`Failed to send message over bridge: ${err}`));
    }
  }

  // --- WebSocket Handlers ---

  private handleOpen(): void {
    this.reconnectAttempt = 0;
    this.lastMessageTimestamp = Date.now();

    // Send Hello Handshake
    const effectiveToken = this.token || 'sdf-studio-bridge';
    const hello: HelloEnvelope = createHelloEnvelope(
      'studio',
      effectiveToken,
      this.appVersion,
      this.capabilities
    );
    this.send(hello);

    // Arm heartbeat watchdog while awaiting welcome
    this.startWatchdog();
  }

  private handleMessage(event: MessageEvent): void {
    this.lastMessageTimestamp = Date.now();
    this.resetWatchdogTimer();

    let msg: any;
    try {
      msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch (err) {
      this.emitError(new Error(`Malformed JSON received from bridge: ${err}`));
      return;
    }

    if (!msg || typeof msg !== 'object') return;

    // 1. Welcome handshake
    if (msg.type === 'welcome') {
      const welcome = msg as WelcomeEnvelope;
      this.sessionId = welcome.sessionId;
      if (welcome.active) {
        this.setStatus('connected');
      } else {
        this.setStatus('parked');
      }
      this.startHeartbeat();
      return;
    }

    // 2. Ping / Pong
    if (msg.type === 'ping') {
      this.send({ v: PROTOCOL_VERSION, type: 'pong' });
      return;
    }
    if (msg.type === 'pong') {
      // Received pong keepalive; watchdog was reset above
      return;
    }

    // 3. Inbound MCP request
    if (msg.type === 'request') {
      const request = msg as RequestEnvelope;
      this.dispatchEvent(
        new CustomEvent('request-received', {
          detail: { request }
        })
      );
      return;
    }
  }

  private handleError(event: Event): void {
    this.emitError(new Error(`WebSocket error on bridge: ${event.type}`));
  }

  private handleClose(event: CloseEvent): void {
    this.clearTimers();
    this.sessionId = null;

    if (this.isExplicitlyClosed) {
      this.setStatus('off');
      return;
    }

    this.setStatus('listening');
    this.scheduleReconnect();
  }

  // --- Timers & Heartbeat ---

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ v: PROTOCOL_VERSION, type: 'ping' });
      }
    }, this.pingIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private startWatchdog(): void {
    this.resetWatchdogTimer();
  }

  private resetWatchdogTimer(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
    }
    this.watchdogTimer = setTimeout(() => {
      // Dead connection: no response from hub in heartbeatTimeoutMs
      if (this.ws && !this.isExplicitlyClosed) {
        try {
          this.ws.close(4000, 'Heartbeat timeout');
        } catch {
          // Ignore
        }
      }
    }, this.heartbeatTimeoutMs);
  }

  private stopWatchdog(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private clearTimers(): void {
    this.stopHeartbeat();
    this.stopWatchdog();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.isExplicitlyClosed) return;

    const delay = this.backoffDelays[
      Math.min(this.reconnectAttempt, this.backoffDelays.length - 1)
    ];
    this.reconnectAttempt++;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      if (!this.isExplicitlyClosed) {
        this.connect();
      }
    }, delay);
  }

  private setStatus(newStatus: BridgeStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.dispatchEvent(
        new CustomEvent('status-changed', {
          detail: {
            status: this.status,
            sessionId: this.sessionId,
            token: this.token
          }
        })
      );
    }
  }

  private emitError(error: Error): void {
    this.dispatchEvent(
      new CustomEvent('bridge-error', {
        detail: { error }
      })
    );
  }
}
