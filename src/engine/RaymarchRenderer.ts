import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { RaymarchMaterial } from './RaymarchMaterial';
import { CSGTree } from '../tree/CSGTree';
import { UniformPacker } from './UniformPacker';
import { SceneStore } from '../store/SceneStore';

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

    dom.addEventListener('mousedown', (e) => {
      if (this.isGizmoDragging) return;
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

    window.addEventListener('mouseup', () => {
      this.isRotating = false;
      this.isPanning = false;
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
    }
  }

  // Lookdev & Matcap Controls
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
