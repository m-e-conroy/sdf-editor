import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { RaymarchRenderer } from './RaymarchRenderer';
import { SceneStore } from '../store/SceneStore';
import { CSGTree } from '../tree/CSGTree';

const mockRendererState = {
  currentWidth: 800,
  currentHeight: 600,
  pixelRatio: 2,
};

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();

  class MockWebGLRenderer {
    domElement: any;
    constructor() {
      this.domElement = (globalThis as any).__mockCanvas;
    }
    setPixelRatio = vi.fn((pr: number) => {
      mockRendererState.pixelRatio = pr;
    });
    getPixelRatio = vi.fn(() => mockRendererState.pixelRatio);
    setSize = vi.fn((w: number, h: number, _updateStyle?: boolean) => {
      mockRendererState.currentWidth = w;
      mockRendererState.currentHeight = h;
      if ((globalThis as any).__mockCanvas) {
        (globalThis as any).__mockCanvas.width = w * mockRendererState.pixelRatio;
        (globalThis as any).__mockCanvas.height = h * mockRendererState.pixelRatio;
      }
    });
    getSize = vi.fn((target: any) => {
      target.set(mockRendererState.currentWidth, mockRendererState.currentHeight);
      return target;
    });
    render = vi.fn((scene: any, camera: any) => {
      if ((globalThis as any).__capturedRenders) {
        (globalThis as any).__capturedRenders.push({ scene, camera: camera.clone() });
      }
    });
    dispose = vi.fn();
  }

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer
  };
});

describe('RaymarchRenderer Snapshot & Contact Sheet Engine', () => {
  let mockContainer: any;
  let mockCanvas: any;
  let mockCtx2D: any;
  let renderer: RaymarchRenderer;
  let capturedRenders: Array<{ scene: any; camera: any }>;
  let mockToDataUrlCalls: string[];

  beforeEach(() => {
    capturedRenders = [];
    mockToDataUrlCalls = [];

    // Mock 2D Context for Canvas compositing
    mockCtx2D = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textBaseline: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 40 })
    };

    // Mock HTMLCanvasElement
    mockCanvas = {
      width: 800,
      height: 600,
      clientWidth: 800,
      clientHeight: 600,
      style: {
        touchAction: '',
        width: '800px',
        height: '600px'
      },
      toDataURL: vi.fn((format?: string) => {
        const fmt = format || 'image/png';
        mockToDataUrlCalls.push(fmt);
        return `data:${fmt};base64,mockImageData_${mockCanvas.width}x${mockCanvas.height}`;
      }),
      getContext: vi.fn((type: string) => {
        if (type === '2d') return mockCtx2D;
        return null;
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600
      })
    };

    // Mock Container
    mockContainer = {
      clientWidth: 800,
      clientHeight: 600,
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    // Stub global browser APIs
    vi.stubGlobal('window', {
      devicePixelRatio: 2,
      innerWidth: 1920,
      innerHeight: 1080,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    });

    const mockDocument = {
      documentElement: {
        getAttribute: vi.fn().mockReturnValue('dark')
      },
      createElement: vi.fn((tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            toDataURL: vi.fn((fmt?: string) => `data:${fmt || 'image/png'};base64,mockCompositeData`),
            getContext: vi.fn().mockReturnValue(mockCtx2D)
          };
        }
        if (tag === 'a') {
          return {
            download: '',
            href: '',
            click: vi.fn()
          };
        }
        return {
          style: {},
          appendChild: vi.fn(),
          addEventListener: vi.fn()
        };
      })
    };
    vi.stubGlobal('document', mockDocument);

    // Mock Image constructor for contact sheet loading
    class MockImage {
      public src = '';
      public crossOrigin = '';
      public onload: (() => void) | null = null;
      public onerror: ((err: any) => void) | null = null;
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    }
    vi.stubGlobal('Image', MockImage);

    // Mock ResizeObserver
    class MockResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    (globalThis as any).__mockCanvas = mockCanvas;
    (globalThis as any).__capturedRenders = capturedRenders;
    mockRendererState.currentWidth = 800;
    mockRendererState.currentHeight = 600;
    mockRendererState.pixelRatio = 2;

    // Reset SceneStore
    (SceneStore as any).instance = null;
    const store = SceneStore.getInstance();
    store.tree.root = CSGTree.createDefaultScene();

    renderer = new RaymarchRenderer(mockContainer);
  });

  afterEach(() => {
    renderer.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('renderSnapshot (Single View Clean Capture)', () => {
    it('should render a snapshot with default perspective view and return image details', async () => {
      const result = await renderer.renderSnapshot({ view: 'perspective' });

      expect(result.dataUrl).toContain('data:image/png;base64,');
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.camera.target).toEqual([0, 0, 0]);

      // Perspective angle is [3.2 * sin(0.8), 2.2, 3.2 * cos(0.8)]
      const expectedX = 3.2 * Math.sin(0.8);
      const expectedY = 2.2;
      const expectedZ = 3.2 * Math.cos(0.8);
      expect(result.camera.position[0]).toBeCloseTo(expectedX, 3);
      expect(result.camera.position[1]).toBeCloseTo(expectedY, 3);
      expect(result.camera.position[2]).toBeCloseTo(expectedZ, 3);
    });

    it('should position the camera for standard orthographic-like presets: front, right, top', async () => {
      // Front view
      const front = await renderer.renderSnapshot({ view: 'front' });
      expect(front.camera.position[0]).toBeCloseTo(0, 3);
      expect(front.camera.position[1]).toBeCloseTo(0, 3);
      expect(front.camera.position[2]).toBeCloseTo(4.0, 3);
      expect(front.camera.target).toEqual([0, 0, 0]);

      // Right view
      const right = await renderer.renderSnapshot({ view: 'right' });
      expect(right.camera.position[0]).toBeCloseTo(4.0, 3);
      expect(right.camera.position[1]).toBeCloseTo(0, 3);
      expect(right.camera.position[2]).toBeCloseTo(0, 3);
      expect(right.camera.target).toEqual([0, 0, 0]);

      // Top view
      const top = await renderer.renderSnapshot({ view: 'top' });
      expect(top.camera.position[0]).toBeCloseTo(0, 3);
      expect(top.camera.position[1]).toBeCloseTo(4.0, 3);
      expect(top.camera.position[2]).toBeCloseTo(0.001, 3);
      expect(top.camera.target).toEqual([0, 0, 0]);
    });

    it('should respect custom cameraPos and cameraTarget', async () => {
      const result = await renderer.renderSnapshot({
        cameraPos: [10, 5, -10],
        cameraTarget: [1, 2, 3]
      });

      expect(result.camera.position).toEqual([10, 5, -10]);
      expect(result.camera.target).toEqual([1, 2, 3]);
    });

    it('should support custom width, height and image formats', async () => {
      const result = await renderer.renderSnapshot({
        width: 512,
        height: 512,
        format: 'image/jpeg'
      });

      expect(result.width).toBe(512);
      expect(result.height).toBe(512);
      expect(result.dataUrl).toContain('data:image/jpeg;base64,');
    });

    it('should be non-destructive: perfectly restores camera, grid, highlight, and renderer size', async () => {
      // Initial state setup
      renderer.setCameraView('right');
      const camPosBefore = (renderer as any).camera.position.clone();
      const camQuatBefore = (renderer as any).camera.quaternion.clone();
      const gridBefore = renderer.isShowGrid();
      const highlightBefore = (renderer as any).material.uniforms.uSelectedNodeIndex.value;
      const sizeBefore = new THREE.Vector2();
      (renderer as any).renderer.getSize(sizeBefore);

      // Perform destructive-looking snapshot with overrides
      await renderer.renderSnapshot({
        view: 'top',
        width: 256,
        height: 256,
        showGrid: !gridBefore,
        highlightNodeIndex: 99
      });

      // Verify state was completely restored
      const camPosAfter = (renderer as any).camera.position;
      const camQuatAfter = (renderer as any).camera.quaternion;
      const gridAfter = renderer.isShowGrid();
      const highlightAfter = (renderer as any).material.uniforms.uSelectedNodeIndex.value;
      const sizeAfter = new THREE.Vector2();
      (renderer as any).renderer.getSize(sizeAfter);

      expect(camPosAfter.x).toBeCloseTo(camPosBefore.x, 4);
      expect(camPosAfter.y).toBeCloseTo(camPosBefore.y, 4);
      expect(camPosAfter.z).toBeCloseTo(camPosBefore.z, 4);
      expect(camQuatAfter.x).toBeCloseTo(camQuatBefore.x, 4);
      expect(camQuatAfter.y).toBeCloseTo(camQuatBefore.y, 4);
      expect(camQuatAfter.z).toBeCloseTo(camQuatBefore.z, 4);
      expect(gridAfter).toBe(gridBefore);
      expect(highlightAfter).toBe(highlightBefore);
      expect(sizeAfter.x).toBe(sizeBefore.x);
      expect(sizeAfter.y).toBe(sizeBefore.y);
    });

    it('should temporarily detach gizmo during snapshot and reattach if it was active', async () => {
      const transformControls = (renderer as any).transformControls;
      const gizmoProxy = (renderer as any).gizmoProxy;

      // Attach gizmo
      transformControls.attach(gizmoProxy);
      expect(transformControls.object).toBe(gizmoProxy);

      const detachSpy = vi.spyOn(transformControls, 'detach');
      const attachSpy = vi.spyOn(transformControls, 'attach');

      await renderer.renderSnapshot({ view: 'perspective' });

      expect(detachSpy).toHaveBeenCalled();
      expect(attachSpy).toHaveBeenCalledWith(gizmoProxy);
      expect(transformControls.object).toBe(gizmoProxy);
    });
  });

  describe('renderContactSheet (2x2 Multi-View Grid)', () => {
    it('should render 4 quadrants into a 2x2 grid and return the composite image', async () => {
      const sheet = await renderer.renderContactSheet({
        viewWidth: 512,
        viewHeight: 512,
        format: 'image/png'
      });

      expect(sheet.width).toBe(1024);
      expect(sheet.height).toBe(1024);
      expect(sheet.dataUrl).toContain('data:image/png;base64,mockCompositeData');

      // Verify 4 quadrant snapshots were rendered: front, right, top, perspective
      expect(capturedRenders.length).toBeGreaterThanOrEqual(4);

      // Verify canvas 2D draw operations for each quadrant and divider lines
      expect(mockCtx2D.drawImage).toHaveBeenCalledTimes(4);
      expect(mockCtx2D.stroke).toHaveBeenCalled();
    });
  });

  describe('captureSnapshot (HUD Download Trigger)', () => {
    it('should invoke renderSnapshot and trigger browser download link', async () => {
      const renderSnapshotSpy = vi.spyOn(renderer, 'renderSnapshot');

      await renderer.captureSnapshot('custom-test-snapshot.png');

      expect(renderSnapshotSpy).toHaveBeenCalledWith({ format: 'image/png' });
    });
  });
});
