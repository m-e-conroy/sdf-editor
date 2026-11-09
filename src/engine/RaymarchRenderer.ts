import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { RaymarchMaterial } from './RaymarchMaterial';
import { CSGTree } from '../tree/CSGTree';
import { UniformPacker } from './UniformPacker';
import { SceneStore } from '../store/SceneStore';
import { ScenePicker } from './ScenePicker';

export interface RenderSnapshotOptions {
  view?: 'front' | 'right' | 'top' | 'perspective';
  cameraPos?: [number, number, number];
  cameraTarget?: [number, number, number];
  width?: number;
  height?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  showGrid?: boolean;
  highlightNodeIndex?: number;
}

export interface RenderSnapshotResult {
  dataUrl: string;
  width: number;
  height: number;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
}

export interface RenderContactSheetOptions {
  views?: ('front' | 'right' | 'top' | 'perspective')[];
  viewWidth?: number;
  viewHeight?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
}

export interface RenderContactSheetResult {
  dataUrl: string;
  width: number;
  height: number;
}

export class RaymarchRenderer {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private material: RaymarchMaterial;
  private quad: THREE.Mesh;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private tree: CSGTree | null = null;
  private sceneStore = SceneStore.getInstance();

  // 3D Transform Gizmo
  private transformControls: TransformControls;
  private gizmoProxy: THREE.Object3D;
  private isGizmoDragging = false;
  private isUpdatingFromStore = false;

  // Orbit controls state
  private isRotating = false;
  private isPanning = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  private spherical = new THREE.Spherical(4.0, Math.PI / 3, Math.PI / 4);
  private target = new THREE.Vector3(0, 0, 0);

  // Lookdev feature toggles
  private shadowsEnabled = true;
  private aoEnabled = true;

  // Performance telemetry
  public fps = 60;
  private frameCount = 0;
  private lastFpsUpdate = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // Setup WebGL2 Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Setup Scene & Screen-space Quad
    this.scene = new THREE.Scene();
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    this.material = new RaymarchMaterial();
    this.quad = new THREE.Mesh(quadGeometry, this.material);
    this.scene.add(this.quad);

    // Setup Virtual Perspective Camera
    const aspect = this.container.clientWidth / Math.max(1, this.container.clientHeight);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100.0);
    this.updateCameraTransform();

    // Setup Gizmo Proxy & TransformControls
    this.gizmoProxy = new THREE.Object3D();
    this.scene.add(this.gizmoProxy);

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.size = 0.75;
    const gizmoObject: any = this.transformControls;
    this.scene.add(gizmoObject.getHelper ? gizmoObject.getHelper() : gizmoObject);

    this.setupGizmoListeners();
    this.setupOrbitHandlers();
    this.setupResizeObserver();
    this.setupStoreListeners();
  }

  private setupGizmoListeners(): void {
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.isGizmoDragging = Boolean(event.value);
    });

    this.transformControls.addEventListener('objectChange', () => {
      if (this.isUpdatingFromStore) return;

      const selectedId = this.sceneStore.selectedNodeId;
      if (!selectedId) return;

      const pos: [number, number, number] = [
        this.gizmoProxy.position.x,
        this.gizmoProxy.position.y,
        this.gizmoProxy.position.z
      ];
      const rot: [number, number, number] = [
        this.gizmoProxy.rotation.x,
        this.gizmoProxy.rotation.y,
        this.gizmoProxy.rotation.z
      ];
      const scale: [number, number, number] = [
        this.gizmoProxy.scale.x,
        this.gizmoProxy.scale.y,
        this.gizmoProxy.scale.z
      ];

      this.sceneStore.updateNode(selectedId, {
        transform: { position: pos, rotation: rot, scale }
      });
    });

    window.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement | null;
      const isEditing = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
      if (isEditing) return;

      if (e.key === 'g' || e.key === 'G' || e.key === 'w' || e.key === 'W') {
        this.setGizmoMode('translate');
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'e' || e.key === 'E') {
        this.setGizmoMode('rotate');
      } else if (e.key === 's' || e.key === 'S') {
        this.setGizmoMode('scale');
      }
    });

    window.addEventListener('set-gizmo-mode', ((e: CustomEvent<{ mode: 'translate' | 'rotate' | 'scale' }>) => {
      if (e.detail?.mode) {
        this.setGizmoMode(e.detail.mode);
      }
    }) as EventListener);
  }

  private setupStoreListeners(): void {
    const syncGizmoToSelected = () => {
      const selected = this.sceneStore.getSelectedNode();
      if (selected && selected.id !== this.sceneStore.tree.root.id) {
        this.isUpdatingFromStore = true;
        this.gizmoProxy.position.set(...selected.transform.position);
        this.gizmoProxy.rotation.set(...selected.transform.rotation);
        this.gizmoProxy.scale.set(...selected.transform.scale);
        this.gizmoProxy.updateMatrixWorld();
        this.transformControls.attach(this.gizmoProxy);
        this.isUpdatingFromStore = false;
      } else {
        this.transformControls.detach();
      }

      if (this.tree) {
        if (selected) {
          const flattened = this.tree.flattenWithTransforms();
          const selIdx = flattened.findIndex(item => item.node.id === selected.id);
          this.material.setSelectedNodeIndex(selIdx);
        } else {
          this.material.setSelectedNodeIndex(-1);
        }
      }
    };

    this.sceneStore.addEventListener('selection-changed', syncGizmoToSelected);
    this.sceneStore.addEventListener('scene-changed', () => {
      this.syncUniforms();
      syncGizmoToSelected();
    });

    syncGizmoToSelected();
  }

  private updateCameraTransform(): void {
    this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius, 1.2, 40.0);
    this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.05, Math.PI - 0.05);

    this.camera.position.setFromSpherical(this.spherical).add(this.target);
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
    this.camera.updateProjectionMatrix();
  }

  private setupOrbitHandlers(): void {
    const dom = this.renderer.domElement;
    let mouseDownPos = { x: 0, y: 0 };
    let mouseDownTime = 0;

    dom.addEventListener('mousedown', (e) => {
      if (this.isGizmoDragging) return;
      mouseDownPos = { x: e.clientX, y: e.clientY };
      mouseDownTime = performance.now();

      if (e.button === 0) {
        this.isRotating = true;
      } else if (e.button === 1 || e.button === 2) {
        this.isPanning = true;
      }
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isGizmoDragging) return;
      if (!this.isRotating && !this.isPanning) return;

      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      if (this.isRotating) {
        this.spherical.theta -= deltaX * 0.006;
        this.spherical.phi -= deltaY * 0.006;
        this.updateCameraTransform();
      } else if (this.isPanning) {
        const panSpeed = 0.002 * this.spherical.radius;
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
        this.target.addScaledVector(right, -deltaX * panSpeed);
        this.target.addScaledVector(up, deltaY * panSpeed);
        this.updateCameraTransform();
      }
    });

    window.addEventListener('mouseup', (e) => {
      const wasRotating = this.isRotating;
      const wasPanning = this.isPanning;
      this.isRotating = false;
      this.isPanning = false;

      // Check for clean click (distance < 5px and duration < 400ms) on primary button
      if (
        e.button === 0 &&
        !this.isGizmoDragging &&
        (wasRotating || wasPanning || e.target === dom)
      ) {
        const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
        const elapsed = performance.now() - mouseDownTime;
        if (dist < 5 && elapsed < 400 && this.tree) {
          const hitId = ScenePicker.pick(
            e.clientX,
            e.clientY,
            dom.getBoundingClientRect(),
            this.camera,
            this.tree
          );
          // If hit a shape, select it; if hit background/floor, deselect (pass null)
          this.sceneStore.selectNode(hitId);
        }
      }
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius *= e.deltaY > 0 ? 1.08 : 0.92;
      this.updateCameraTransform();
    }, { passive: false });

    dom.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private setupResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width === 0 || height === 0) return;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.material.setResolution(width, height);
    });

    resizeObserver.observe(this.container);
  }

  public setTree(tree: CSGTree): void {
    this.tree = tree;
    this.syncUniforms();
  }

  public syncUniforms(): void {
    if (this.tree) {
      const packed = UniformPacker.pack(this.tree);
      this.material.updateNodes(packed);

      const selected = this.sceneStore.getSelectedNode();
      if (selected) {
        const flattened = this.tree.flattenWithTransforms();
        const selIdx = flattened.findIndex(item => item.node.id === selected.id);
        this.material.setSelectedNodeIndex(selIdx);
      } else {
        this.material.setSelectedNodeIndex(-1);
      }
    }
  }

  // Lookdev, Matcap & Visual Controls
  public setMatcapPreset(preset: number): void {
    this.material.setMatcapPreset(preset);
  }

  public toggleShadows(enable?: boolean): void {
    this.shadowsEnabled = enable !== undefined ? enable : !this.shadowsEnabled;
    this.material.setShadowsEnabled(this.shadowsEnabled);
  }

  public toggleAO(enable?: boolean): void {
    this.aoEnabled = enable !== undefined ? enable : !this.aoEnabled;
    this.material.setAOEnabled(this.aoEnabled);
  }

  public toggleGrid(enable?: boolean): void {
    const next = enable !== undefined ? enable : !this.material.isShowGrid();
    this.material.setShowGrid(next);
  }

  public isShowGrid(): boolean {
    return this.material.isShowGrid();
  }

  public async renderSnapshot(opts?: RenderSnapshotOptions): Promise<RenderSnapshotResult> {
    // 1. Non-destructive state capture
    const wasAttached = !!this.transformControls.object;
    if (wasAttached) {
      this.transformControls.detach();
    }

    const origSelectedNodeIndex = (this.material.uniforms.uSelectedNodeIndex?.value as number) ?? -1;
    const origShowGrid = this.material.isShowGrid();

    const origSize = new THREE.Vector2();
    this.renderer.getSize(origSize);
    const origPixelRatio = this.renderer.getPixelRatio();
    const origWidth = origSize.x || this.container.clientWidth || 800;
    const origHeight = origSize.y || this.container.clientHeight || 600;

    const origCamPos = this.camera.position.clone();
    const origCamQuat = this.camera.quaternion.clone();
    const origAspect = this.camera.aspect;
    const origSpherical = this.spherical.clone();
    const origTarget = this.target.clone();

    const targetW = opts?.width ?? origWidth;
    const targetH = opts?.height ?? origHeight;
    const needsResize = opts?.width !== undefined || opts?.height !== undefined;

    const snapTarget = new THREE.Vector3();
    if (opts?.cameraTarget) {
      snapTarget.set(...opts.cameraTarget);
    } else if (!opts?.view) {
      snapTarget.copy(this.target);
    } else {
      snapTarget.set(0, 0, 0);
    }

    const snapPos = new THREE.Vector3();
    if (opts?.cameraPos) {
      snapPos.set(...opts.cameraPos);
    } else if (opts?.view === 'front') {
      snapPos.set(0, 0, 4.0).add(snapTarget);
    } else if (opts?.view === 'right') {
      snapPos.set(4.0, 0, 0).add(snapTarget);
    } else if (opts?.view === 'top') {
      // Offset slightly along Z to preserve up-vector during lookAt
      snapPos.set(0, 4.0, 0.001).add(snapTarget);
    } else if (opts?.view === 'perspective') {
      snapPos.set(3.2 * Math.sin(0.8), 2.2, 3.2 * Math.cos(0.8)).add(snapTarget);
    } else {
      snapPos.copy(this.camera.position);
    }

    try {
      // 2. Apply temporary overrides
      this.material.setSelectedNodeIndex(opts?.highlightNodeIndex ?? -1);

      if (opts?.showGrid !== undefined) {
        this.material.setShowGrid(opts.showGrid);
      }

      if (needsResize) {
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(targetW, targetH, false);
        this.material.setResolution(targetW, targetH);
        this.camera.aspect = targetW / Math.max(1, targetH);
        this.camera.updateProjectionMatrix();
      }

      if (opts?.view || opts?.cameraPos || opts?.cameraTarget) {
        this.camera.position.copy(snapPos);
        this.camera.lookAt(snapTarget);
        this.camera.updateMatrixWorld();
        this.camera.updateProjectionMatrix();
      }

      // 3. Render frame with updated camera uniforms
      const elapsedTime = this.clock.getElapsedTime();
      const theme = (typeof document !== 'undefined' && document.documentElement?.getAttribute('data-theme') === 'light') ? 'light' : 'dark';
      this.material.updateCamera(this.camera, elapsedTime, theme);
      this.renderer.render(this.scene, this.camera);

      // 4. Extract image data URL
      const format = opts?.format || 'image/png';
      const dataUrl = this.renderer.domElement.toDataURL(format);

      const finalWidth = targetW;
      const finalHeight = targetH;

      return {
        dataUrl,
        width: finalWidth,
        height: finalHeight,
        camera: {
          position: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
          target: [snapTarget.x, snapTarget.y, snapTarget.z]
        }
      };
    } finally {
      // 5. Restore original state completely
      this.camera.position.copy(origCamPos);
      this.camera.quaternion.copy(origCamQuat);
      this.camera.aspect = origAspect;
      this.camera.updateMatrixWorld();
      this.camera.updateProjectionMatrix();
      this.target.copy(origTarget);
      this.spherical.copy(origSpherical);

      if (needsResize) {
        this.renderer.setPixelRatio(origPixelRatio);
        this.renderer.setSize(origWidth, origHeight, false);
        this.material.setResolution(origWidth, origHeight);
        this.camera.aspect = origWidth / Math.max(1, origHeight);
        this.camera.updateProjectionMatrix();
      }

      this.material.setShowGrid(origShowGrid);
      this.material.setSelectedNodeIndex(origSelectedNodeIndex);

      const restoreTime = this.clock.getElapsedTime();
      const restoreTheme = (typeof document !== 'undefined' && document.documentElement?.getAttribute('data-theme') === 'light') ? 'light' : 'dark';
      this.material.updateCamera(this.camera, restoreTime, restoreTheme);

      if (wasAttached) {
        this.transformControls.attach(this.gizmoProxy);
      }
    }
  }

  public async renderContactSheet(opts?: RenderContactSheetOptions): Promise<RenderContactSheetResult> {
    const views = opts?.views ?? ['front', 'right', 'top', 'perspective'];
    const viewW = opts?.viewWidth ?? 512;
    const viewH = opts?.viewHeight ?? 512;
    const totalW = viewW * 2;
    const totalH = viewH * 2;
    const format = opts?.format || 'image/png';

    // Render individual quadrant snapshots
    const snapshots: { view: string; dataUrl: string }[] = [];
    for (const view of views.slice(0, 4)) {
      const snap = await this.renderSnapshot({
        view,
        width: viewW,
        height: viewH,
        format: 'image/png'
      });
      snapshots.push({ view, dataUrl: snap.dataUrl });
    }

    if (typeof document === 'undefined') {
      throw new Error('renderContactSheet requires DOM environment for canvas compositing');
    }

    const canvas = document.createElement('canvas');
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create 2D canvas context for contact sheet composite');
    }

    // Neutral dark background
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, totalW, totalH);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load snapshot for contact sheet composite'));
        img.src = src;
      });
    };

    const images = await Promise.all(snapshots.map((s) => loadImage(s.dataUrl)));

    const quadCoords = [
      { x: 0, y: 0 },
      { x: viewW, y: 0 },
      { x: 0, y: viewH },
      { x: viewW, y: viewH }
    ];

    for (let i = 0; i < images.length; i++) {
      const { x, y } = quadCoords[i];
      const img = images[i];
      const viewName = snapshots[i].view;

      ctx.drawImage(img, x, y, viewW, viewH);

      // Clean labeled overlay badge
      const label = viewName.toUpperCase();
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "JetBrains Mono", monospace';
      const textMetrics = ctx.measureText(label);
      const padX = 8;
      const padY = 4;
      const badgeW = textMetrics.width + padX * 2;
      const badgeH = 12 + padY * 2;
      const badgeX = x + 12;
      const badgeY = y + 12;

      ctx.fillStyle = 'rgba(12, 14, 20, 0.82)';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, 4);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, badgeX + padX, badgeY + badgeH / 2);
    }

    // 1px clean grid lines dividing quadrants
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1;

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(viewW, 0);
    ctx.lineTo(viewW, totalH);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, viewH);
    ctx.lineTo(totalW, viewH);
    ctx.stroke();

    const compositeDataUrl = canvas.toDataURL(format);
    return {
      dataUrl: compositeDataUrl,
      width: totalW,
      height: totalH
    };
  }

  public async captureSnapshot(filename: string = 'sdf-studio-scene.png'): Promise<void> {
    const result = await this.renderSnapshot({ format: 'image/png' });

    const link = document.createElement('a');
    link.download = filename;
    link.href = result.dataUrl;
    link.click();
  }

  // Camera Viewpoint Presets
  public setCameraView(view: 'front' | 'right' | 'top'): void {
    if (view === 'front') {
      this.spherical.theta = 0;
      this.spherical.phi = Math.PI / 2;
    } else if (view === 'right') {
      this.spherical.theta = Math.PI / 2;
      this.spherical.phi = Math.PI / 2;
    } else if (view === 'top') {
      this.spherical.theta = 0;
      this.spherical.phi = 0.05; // Slightly offset to maintain up-vector
    }
    this.updateCameraTransform();
  }

  public focusOnSelected(): void {
    const selected = this.sceneStore.getSelectedNode();
    if (selected) {
      this.target.set(...selected.transform.position);
      this.updateCameraTransform();
    }
  }

  public setGizmoMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.transformControls.setMode(mode);
    window.dispatchEvent(new CustomEvent('gizmo-mode-changed', { detail: { mode } }));
  }

  public getGizmoMode(): 'translate' | 'rotate' | 'scale' {
    return (this.transformControls as any).mode || 'translate';
  }

  public start(getTheme: () => 'dark' | 'light'): void {
    const renderLoop = () => {
      const elapsedTime = this.clock.getElapsedTime();
      this.material.updateCamera(this.camera, elapsedTime, getTheme());
      this.renderer.render(this.scene, this.camera);

      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsUpdate >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
        this.frameCount = 0;
        this.lastFpsUpdate = now;
      }

      this.animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy(): void {
    this.stop();
    this.transformControls.dispose();
    this.renderer.dispose();
    this.material.dispose();
  }
}
