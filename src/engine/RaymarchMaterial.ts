import * as THREE from 'three';
import vertexShader from './shaders/raymarch.vert.glsl?raw';
import fragmentShader from './shaders/raymarch.frag.glsl?raw';
import { MAX_GPU_NODES, PackedUniformData } from './UniformPacker';

export class RaymarchMaterial extends THREE.ShaderMaterial {
  constructor() {
    // Preallocate uniform buffers for MAX_GPU_NODES (32)
    const dummyMatrices: THREE.Matrix4[] = [];
    const dummyTypes: number[] = [];
    const dummyDimensions: THREE.Vector4[] = [];
    const dummyCSG: THREE.Vector4[] = [];
    const dummyModifiers: THREE.Vector4[] = [];
    const dummyArrayModifiers: THREE.Vector4[] = [];
    const dummyMaterials: THREE.Vector4[] = [];

    for (let i = 0; i < MAX_GPU_NODES; i++) {
      dummyMatrices.push(new THREE.Matrix4());
      dummyTypes.push(0);
      dummyDimensions.push(new THREE.Vector4(0.8, 0.8, 0.8, 0.0));
      dummyCSG.push(new THREE.Vector4(0, 0, 0, 0));
      dummyModifiers.push(new THREE.Vector4(0, 0, 0, 0));
      dummyArrayModifiers.push(new THREE.Vector4(1, 1, 0, 0));
      dummyMaterials.push(new THREE.Vector4(0.85, 0.85, 0.85, 0.4));
    }

    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uCameraPos: { value: new THREE.Vector3() },
        uCameraWorldMatrix: { value: new THREE.Matrix4() },
        uCameraInverseProj: { value: new THREE.Matrix4() },
        uNear: { value: 0.1 },
        uFar: { value: 100.0 },
        uTime: { value: 0.0 },
        uThemeMode: { value: 0 },
        uMatcapPreset: { value: 0 },    // 0: Dark Clay, 1: Red Wax, 2: Normal Map, 3: Chrome, 4: Sunset Horizon
        uShadowsEnabled: { value: 1 },  // 1 = enabled, 0 = disabled
        uEnableShadows: { value: 1 },   // alias
        uAOEnabled: { value: 1 },       // 1 = enabled, 0 = disabled
        uEnableAO: { value: 1 },        // alias
        uShowGrid: { value: 1 },        // 1 = show CAD floor grid, 0 = hide
        uSelectedNodeIndex: { value: -1 }, // Index of selected node for highlight contour
        uNodeCount: { value: 0 },
        uNodeInvMatrices: { value: dummyMatrices },
        uNodeTypes: { value: dummyTypes },
        uNodeDimensions: { value: dummyDimensions },
        uNodeCSG: { value: dummyCSG },
        uNodeModifiers: { value: dummyModifiers },
        uNodeArrayModifiers: { value: dummyArrayModifiers },
        uNodeMaterials: { value: dummyMaterials }
      },
      depthWrite: true,
      depthTest: true
    });
  }

  public updateCamera(camera: THREE.PerspectiveCamera, time: number, theme: 'dark' | 'light'): void {
    this.uniforms.uCameraPos.value.copy(camera.position);
    this.uniforms.uCameraWorldMatrix.value.copy(camera.matrixWorld);
    this.uniforms.uCameraInverseProj.value.copy(camera.projectionMatrixInverse);
    this.uniforms.uNear.value = camera.near;
    this.uniforms.uFar.value = camera.far;
    this.uniforms.uTime.value = time;
    this.uniforms.uThemeMode.value = theme === 'dark' ? 0 : 1;
  }

  public updateNodes(packed: PackedUniformData): void {
    this.uniforms.uNodeCount.value = packed.nodeCount;
    for (let i = 0; i < MAX_GPU_NODES; i++) {
      this.uniforms.uNodeInvMatrices.value[i].copy(packed.inverseMatrices[i]);
      this.uniforms.uNodeTypes.value[i] = packed.types[i];
      this.uniforms.uNodeDimensions.value[i].copy(packed.dimensions[i]);
      this.uniforms.uNodeCSG.value[i].copy(packed.csgConfig[i]);
      this.uniforms.uNodeModifiers.value[i].copy(packed.modifiers[i]);
      this.uniforms.uNodeArrayModifiers.value[i].copy(packed.arrayModifiers[i]);
      this.uniforms.uNodeMaterials.value[i].copy(packed.materials[i]);
    }
  }

  public setShowGrid(show: boolean): void {
    if (this.uniforms.uShowGrid) {
      this.uniforms.uShowGrid.value = show ? 1 : 0;
    }
  }

  public isShowGrid(): boolean {
    return this.uniforms.uShowGrid?.value === 1;
  }

  public setSelectedNodeIndex(index: number): void {
    if (this.uniforms.uSelectedNodeIndex) {
      this.uniforms.uSelectedNodeIndex.value = index;
    }
  }

  public setResolution(width: number, height: number): void {
    this.uniforms.uResolution.value.set(width, height);
  }

  public setMatcapPreset(preset: number): void {
    this.uniforms.uMatcapPreset.value = preset;
  }

  public getMatcapPreset(): number {
    return this.uniforms.uMatcapPreset.value;
  }

  public setShadowsEnabled(enabled: boolean): void {
    const val = enabled ? 1 : 0;
    if (this.uniforms.uShadowsEnabled) this.uniforms.uShadowsEnabled.value = val;
    if (this.uniforms.uEnableShadows) this.uniforms.uEnableShadows.value = val;
  }

  public isShadowsEnabled(): boolean {
    return (this.uniforms.uShadowsEnabled?.value === 1) || (this.uniforms.uEnableShadows?.value === 1);
  }

  public setAOEnabled(enabled: boolean): void {
    const val = enabled ? 1 : 0;
    if (this.uniforms.uAOEnabled) this.uniforms.uAOEnabled.value = val;
    if (this.uniforms.uEnableAO) this.uniforms.uEnableAO.value = val;
  }

  public isAOEnabled(): boolean {
    return (this.uniforms.uAOEnabled?.value === 1) || (this.uniforms.uEnableAO?.value === 1);
  }
}
