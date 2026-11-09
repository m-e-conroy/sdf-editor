import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentBridge } from './AgentBridge';

describe('AgentBridge (In-Browser WebSocket Client)', () => {
  let bridge: AgentBridge;
  let mockWsInstances: any[] = [];

  class MockWebSocket {
    public static OPEN = 1;
    public static CLOSED = 3;

    public readyState = MockWebSocket.OPEN;
    public url: string;
    public onopen: (() => void) | null = null;
    public onmessage: ((e: any) => void) | null = null;
    public onerror: ((e: any) => void) | null = null;
    public onclose: ((e: any) => void) | null = null;
    public sentMessages: string[] = [];

    constructor(url: string) {
      this.url = url;
      mockWsInstances.push(this);
      setTimeout(() => {
        if (this.onopen) this.onopen();
      }, 0);
    }

    send(data: string) {
      this.sentMessages.push(data);
    }

    close(code = 1000, reason = 'Normal') {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) {
        this.onclose({ code, reason } as any);
      }
    }
  }

  beforeEach(() => {
    mockWsInstances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);
    vi.stubGlobal('window', {
      location: { hash: '#bridge=test_token_123' }
    });
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });

    (AgentBridge as any).instance = null;
    bridge = new AgentBridge({
      url: 'ws://127.0.0.1:8765',
      pingIntervalMs: 50,
      heartbeatTimeoutMs: 200
    });
  });

  afterEach(() => {
    bridge.disconnect();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should resolve token from URL hash and save to localStorage', () => {
    expect(bridge.token).toBe('test_token_123');
    expect(localStorage.setItem).toHaveBeenCalledWith('sdf_studio_bridge_token', 'test_token_123');
  });

  it('should send HelloEnvelope upon connection', async () => {
    bridge.connect();

    // Wait for async onopen
    await new Promise((r) => setTimeout(r, 10));

    expect(mockWsInstances.length).toBe(1);
    const ws = mockWsInstances[0];
    expect(ws.sentMessages.length).toBeGreaterThanOrEqual(1);

    const firstMsg = JSON.parse(ws.sentMessages[0]);
    expect(firstMsg.type).toBe('hello');
    expect(firstMsg.role).toBe('studio');
    expect(firstMsg.token).toBe('test_token_123');
    expect(firstMsg.capabilities).toContain('groups');
  });

  it('should transition to connected on welcome with active: true', async () => {
    const statusEvents: string[] = [];
    bridge.addEventListener('status-changed', ((e: CustomEvent) => {
      statusEvents.push(e.detail.status);
    }) as EventListener);

    bridge.connect();
    await new Promise((r) => setTimeout(r, 10));

    const ws = mockWsInstances[0];
    ws.onmessage({
      data: JSON.stringify({
        v: 1,
        type: 'welcome',
        sessionId: 'session_abc',
        active: true
      })
    });

    expect(bridge.status).toBe('connected');
    expect(bridge.sessionId).toBe('session_abc');
    expect(statusEvents).toContain('connected');
  });

  it('should transition to parked on welcome with active: false', async () => {
    bridge.connect();
    await new Promise((r) => setTimeout(r, 10));

    const ws = mockWsInstances[0];
    ws.onmessage({
      data: JSON.stringify({
        v: 1,
        type: 'welcome',
        sessionId: 'session_parked_1',
        active: false
      })
    });

    expect(bridge.status).toBe('parked');
  });

  it('should dispatch request-received event on incoming request envelope', async () => {
    bridge.connect();
    await new Promise((r) => setTimeout(r, 10));

    const ws = mockWsInstances[0];
    let receivedRequest: any = null;

    bridge.addEventListener('request-received', ((e: CustomEvent) => {
      receivedRequest = e.detail.request;
    }) as EventListener);

    ws.onmessage({
      data: JSON.stringify({
        v: 1,
        type: 'request',
        id: 'req_1',
        method: 'scene.get'
      })
    });

    expect(receivedRequest).not.toBeNull();
    expect(receivedRequest.id).toBe('req_1');
    expect(receivedRequest.method).toBe('scene.get');
  });

  it('should respond to ping with pong keepalive', async () => {
    bridge.connect();
    await new Promise((r) => setTimeout(r, 10));

    const ws = mockWsInstances[0];
    ws.onmessage({
      data: JSON.stringify({
        v: 1,
        type: 'ping'
      })
    });

    const lastMsg = JSON.parse(ws.sentMessages[ws.sentMessages.length - 1]);
    expect(lastMsg.type).toBe('pong');
  });
});
