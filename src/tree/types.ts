// ========================================================================
// SDF Studio 3D - CSG Abstract Syntax Tree (AST) Type Definitions
// ========================================================================

export type PrimitiveType =
  | 'sphere'
  | 'box'
  | 'cylinder'
  | 'torus'
  | 'capsule'
  | 'cone'
  | 'plane'
  | 'pipe'
  | 'hemisphere'
  | 'ellipsoid'
  | 'superellipsoid'
  | 'pyramid'
  | 'pentagonal_pyramid'
  | 'wedge'
  | 'frustum'
  | 'triangular_prism'
  | 'pentagonal_prism'
  | 'hexagonal_prism'
  | 'tetrahedron'
  | 'octahedron'
  | 'mandelbulb'
  | 'capped_torus'
  | 'chain_link'
  | 'chamfer_cylinder'
  | 'egg'
  | 'heart'
  | 'star_prism';

export interface PrimitiveDimensions {
  radius?: number;
  size?: [number, number, number];
  height?: number;
  radiusMajor?: number;
  radiusMinor?: number;
  thickness?: number;
  radii?: [number, number, number];
  exponents?: [number, number];
  baseRadius?: number;
  topRadius?: number;
  bevelAngle?: number;
  fractalIterations?: number;
  fractalPower?: number;
  arcAngle?: number;
  linkLength?: number;
  chamfer?: number;
  tipRadius?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export type CSGOpType = 'union' | 'difference' | 'intersection';
export type BlendMode = 'hard' | 'smooth_polynomial';

export interface CSGConfig {
  operation: CSGOpType;
  blendMode: BlendMode;
  blendRadius: number; // k smoothing factor (0.0 = hard)
}

export interface MaterialConfig {
  color: string; // Hex color e.g. '#e2e8f0'
  roughness: number; // 0.0 to 1.0
  metalness: number; // 0.0 to 1.0
}

export interface Transform3D {
  position: [number, number, number];
  rotation: [number, number, number]; // Euler angles in radians (XYZ)
  scale: [number, number, number];
}

export interface ModifierConfig {
  roundRadius?: number;
  shellThickness?: number;
  twist?: number;
  twistFactor?: number;
  bendFactor?: number;
  elongation?: [number, number, number];
  mirrorAxis?: 'none' | 'x' | 'y' | 'z';
  mirrorAxes?: [boolean, boolean, boolean]; // [X, Y, Z]
  radialRepeat?: number; // count: 1 to 24
  linearCount?: number;  // count: 1 to 16
  linearSpacing?: number; // spacing: 0.2 to 4.0
}

export interface SDFNode {
  id: string;
  name: string;
  kind: 'primitive' | 'group';
  visible: boolean;
  transform: Transform3D;
  primitive: {
    type: PrimitiveType;
    dimensions: PrimitiveDimensions;
  };
  csg: CSGConfig;
  modifiers?: ModifierConfig;
  material: MaterialConfig;
  children: SDFNode[];
}

export interface SceneMetadata {
  name: string;
  author: string;
  createdAt: string;
  modifiedAt: string;
  generator: string;
}

export interface EnvironmentConfig {
  backgroundColor: string;
  ambientLight: number;
  shadows: boolean;
  ambientOcclusion: boolean;
  matcapPreset: string;
}

export interface SDFSceneDocument {
  version: string;
  metadata: SceneMetadata;
  environment: EnvironmentConfig;
  rootNode: SDFNode;
}

