// ========================================================================
// SDF Studio 3D - Canonical Primitive Registry & Dimension Schemas
// ========================================================================

import { z } from 'zod';

export const PRIMITIVE_TYPES = [
  'sphere',
  'box',
  'cylinder',
  'torus',
  'capsule',
  'cone',
  'pipe',
  'hemisphere',
  'ellipsoid',
  'superellipsoid',
  'pyramid',
  'hexagonal_prism',
  'triangular_prism',
  'tetrahedron',
  'octahedron',
  'mandelbulb',
  'capped_torus',
  'chain_link',
  'chamfer_cylinder',
  'egg',
  'heart',
  'star_prism'
] as const;

export type PrimitiveType = (typeof PRIMITIVE_TYPES)[number];
export const PrimitiveTypeSchema = z.enum(PRIMITIVE_TYPES);

export const PRIMITIVE_CATEGORIES = ['basic', 'cad', 'organic', 'polyhedra', 'fractal'] as const;
export type PrimitiveCategory = (typeof PRIMITIVE_CATEGORIES)[number];

export type DimensionFieldType = 'number' | 'vec2' | 'vec3';

export interface DimensionField {
  label: string;
  description: string;
  type: DimensionFieldType;
  default: number | [number, number] | [number, number, number];
  min?: number;
  max?: number;
  step?: number;
  notes?: string;
}

export interface PrimitiveSchema {
  type: PrimitiveType;
  name: string;
  description: string;
  category: PrimitiveCategory;
  fields: Record<string, DimensionField>;
  defaultDimensions: Record<string, any>;
}

export const PRIMITIVE_SCHEMAS: Record<PrimitiveType, PrimitiveSchema> = {
  sphere: {
    type: 'sphere',
    name: 'Sphere',
    description: 'Exact Euclidean distance sphere with uniform radius.',
    category: 'basic',
    fields: {
      radius: {
        label: 'Radius',
        description: 'Radius of the sphere.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Uniform distance radius.'
      }
    },
    defaultDimensions: {
      radius: 0.8
    }
  },
  box: {
    type: 'box',
    name: 'Box / Cube',
    description: 'Axis-aligned bounding box with half-extents along X, Y, Z.',
    category: 'basic',
    fields: {
      size: {
        label: 'Size (Half Extents)',
        description: 'Half-extents [hx, hy, hz] along X, Y, Z.',
        type: 'vec3',
        default: [0.7, 0.7, 0.7],
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Full cube size is 2 * size. Specified as [x, y, z].'
      }
    },
    defaultDimensions: {
      size: [0.7, 0.7, 0.7]
    }
  },
  cylinder: {
    type: 'cylinder',
    name: 'Cylinder',
    description: 'Capped circular column along Y with height and radius.',
    category: 'basic',
    fields: {
      radius: {
        label: 'Radius',
        description: 'Circular radius of the cylinder cross-section.',
        type: 'number',
        default: 0.5,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Height (Half Extent)',
        description: 'Half-height hy along Y.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Full height is 2 * height (bounds from -height to +height).'
      }
    },
    defaultDimensions: {
      radius: 0.5,
      height: 0.8
    }
  },
  torus: {
    type: 'torus',
    name: 'Torus',
    description: 'Smooth ring/donut with major radius and tube radius in XZ plane.',
    category: 'basic',
    fields: {
      radiusMajor: {
        label: 'Major Radius',
        description: 'Distance from the center of the torus to the tube center.',
        type: 'number',
        default: 0.7,
        min: 0.1,
        max: 5.0,
        step: 0.05
      },
      radiusMinor: {
        label: 'Minor Radius',
        description: 'Radius of the circular tube cross-section.',
        type: 'number',
        default: 0.25,
        min: 0.02,
        max: 2.0,
        step: 0.02
      }
    },
    defaultDimensions: {
      radiusMajor: 0.7,
      radiusMinor: 0.25
    }
  },
  capsule: {
    type: 'capsule',
    name: 'Capsule',
    description: 'Cylinder capped with hemispheres on both ends along Y.',
    category: 'basic',
    fields: {
      radius: {
        label: 'Radius',
        description: 'Radius of the cylindrical section and hemispherical caps.',
        type: 'number',
        default: 0.35,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Segment Half-Height',
        description: 'Half-distance between sphere centers along Y.',
        type: 'number',
        default: 0.6,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Total capsule height is 2 * height + 2 * radius.'
      }
    },
    defaultDimensions: {
      radius: 0.35,
      height: 0.6
    }
  },
  cone: {
    type: 'cone',
    name: 'Capped Cone / Truncated Cone',
    description: 'Cone with base radius at -height and top radius at +height.',
    category: 'basic',
    fields: {
      baseRadius: {
        label: 'Base Radius',
        description: 'Bottom radius r1 at y = -height.',
        type: 'number',
        default: 0.6,
        min: 0.0,
        max: 5.0,
        step: 0.05
      },
      topRadius: {
        label: 'Top Radius',
        description: 'Top radius r2 at y = +height (0.0 for a pointed cone).',
        type: 'number',
        default: 0.0,
        min: 0.0,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Height (Half Extent)',
        description: 'Half-height hy along Y.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Full height is 2 * height.'
      }
    },
    defaultDimensions: {
      baseRadius: 0.6,
      topRadius: 0.0,
      height: 0.8
    }
  },
  pipe: {
    type: 'pipe',
    name: 'Hollow Pipe / Tube',
    description: 'Hollow cylinder with uniform wall thickness along Y.',
    category: 'cad',
    fields: {
      radius: {
        label: 'Radius',
        description: 'Central tube radius.',
        type: 'number',
        default: 0.5,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Height (Half Extent)',
        description: 'Half-height hy along Y.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Full height is 2 * height.'
      },
      thickness: {
        label: 'Wall Thickness',
        description: 'Radial wall thickness.',
        type: 'number',
        default: 0.08,
        min: 0.01,
        max: 1.0,
        step: 0.01
      }
    },
    defaultDimensions: {
      radius: 0.5,
      height: 0.8,
      thickness: 0.08
    }
  },
  hemisphere: {
    type: 'hemisphere',
    name: 'Hemisphere',
    description: 'Upper half of a sphere centered at origin (y >= 0).',
    category: 'basic',
    fields: {
      radius: {
        label: 'Radius',
        description: 'Radius of the hemisphere.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05
      }
    },
    defaultDimensions: {
      radius: 0.8
    }
  },
  ellipsoid: {
    type: 'ellipsoid',
    name: 'Ellipsoid',
    description: '3D ellipsoid with independent semi-axes [rx, ry, rz].',
    category: 'basic',
    fields: {
      radii: {
        label: 'Radii (Semi-Axes)',
        description: 'Semi-axis extents along X, Y, Z.',
        type: 'vec3',
        default: [0.8, 0.6, 0.5],
        min: 0.05,
        max: 5.0,
        step: 0.05
      }
    },
    defaultDimensions: {
      radii: [0.8, 0.6, 0.5]
    }
  },
  superellipsoid: {
    type: 'superellipsoid',
    name: 'Superellipsoid',
    description: 'Superquadric surface blending boxes, cylinders, and spheres.',
    category: 'basic',
    fields: {
      radii: {
        label: 'Radii (Semi-Axes)',
        description: 'Principal semi-axes [rx, ry, rz].',
        type: 'vec3',
        default: [0.8, 0.6, 0.5],
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      exponents: {
        label: 'Exponents',
        description: 'Squareness shape exponents [e1, e2].',
        type: 'vec2',
        default: [1.0, 1.0],
        min: 0.1,
        max: 5.0,
        step: 0.1
      }
    },
    defaultDimensions: {
      radii: [0.8, 0.6, 0.5],
      exponents: [1.0, 1.0]
    }
  },
  pyramid: {
    type: 'pyramid',
    name: 'Pyramid',
    description: 'Square-based pyramid centered on XZ plane with apex at +height.',
    category: 'polyhedra',
    fields: {
      height: {
        label: 'Height',
        description: 'Total height of the pyramid.',
        type: 'number',
        default: 1.0,
        min: 0.1,
        max: 5.0,
        step: 0.05
      }
    },
    defaultDimensions: {
      height: 1.0
    }
  },
  hexagonal_prism: {
    type: 'hexagonal_prism',
    name: 'Hexagonal Prism',
    description: 'Regular 6-sided prism along Z with circumradius and half-height.',
    category: 'cad',
    fields: {
      radius: {
        label: 'Radius',
        description: 'Circumradius of the regular hexagon in XY.',
        type: 'number',
        default: 0.6,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Height (Half Extent)',
        description: 'Half-depth along Z axis.',
        type: 'number',
        default: 0.7,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Full prism length along Z is 2 * height.'
      }
    },
    defaultDimensions: {
      radius: 0.6,
      height: 0.7
    }
  },
  triangular_prism: {
    type: 'triangular_prism',
    name: 'Triangular Prism',
    description: 'Equilateral 3-sided prism along Z with circumradius and half-height.',
    category: 'cad',
    fields: {
      radius: {
        label: 'Radius',
        description: 'Circumradius of the equilateral triangle in XY.',
        type: 'number',
        default: 0.6,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Height (Half Extent)',
        description: 'Half-depth along Z axis.',
        type: 'number',
        default: 0.7,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Full prism length along Z is 2 * height.'
      }
    },
    defaultDimensions: {
      radius: 0.6,
      height: 0.7
    }
  },
  tetrahedron: {
    type: 'tetrahedron',
    name: 'Regular Tetrahedron',
    description: 'Regular 4-sided Platonic polyhedron with uniform scale radius.',
    category: 'polyhedra',
    fields: {
      radius: {
        label: 'Radius / Scale',
        description: 'Circumscribed scale factor.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05
      }
    },
    defaultDimensions: {
      radius: 0.8
    }
  },
  octahedron: {
    type: 'octahedron',
    name: 'Octahedron',
    description: 'Regular 8-faced Platonic solid with uniform size.',
    category: 'polyhedra',
    fields: {
      radius: {
        label: 'Radius / Size',
        description: 'Distance from origin to vertices.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05
      }
    },
    defaultDimensions: {
      radius: 0.8
    }
  },
  mandelbulb: {
    type: 'mandelbulb',
    name: 'Mandelbulb 3D Fractal',
    description: 'Three-dimensional analog of the Mandelbrot fractal.',
    category: 'fractal',
    fields: {
      fractalIterations: {
        label: 'Iterations',
        description: 'Recursion iteration count.',
        type: 'number',
        default: 4,
        min: 1,
        max: 8,
        step: 1
      },
      fractalPower: {
        label: 'Power',
        description: 'Mandelbulb polynomial power (standard is 8).',
        type: 'number',
        default: 8,
        min: 2,
        max: 16,
        step: 1
      }
    },
    defaultDimensions: {
      fractalIterations: 4,
      fractalPower: 8
    }
  },
  capped_torus: {
    type: 'capped_torus',
    name: 'Capped Torus / Torus Arc',
    description: 'Circular ring sector truncated to a specified arc angle.',
    category: 'cad',
    fields: {
      radiusMajor: {
        label: 'Major Radius',
        description: 'Major radius of the circular path.',
        type: 'number',
        default: 0.7,
        min: 0.1,
        max: 5.0,
        step: 0.05
      },
      radiusMinor: {
        label: 'Minor Radius (Tube)',
        description: 'Tube cross-section radius.',
        type: 'number',
        default: 0.25,
        min: 0.02,
        max: 2.0,
        step: 0.02
      },
      arcAngle: {
        label: 'Arc Angle (Radians)',
        description: 'Sweep angle in radians (e.g. 1.5707963 for 90°).',
        type: 'number',
        default: 1.5707963,
        min: 0.1,
        max: 6.2831853,
        step: 0.05
      }
    },
    defaultDimensions: {
      radiusMajor: 0.7,
      radiusMinor: 0.25,
      arcAngle: 1.5707963
    }
  },
  chain_link: {
    type: 'chain_link',
    name: 'Chain Link',
    description: 'Elongated stadium torus representing a single chain link.',
    category: 'cad',
    fields: {
      linkLength: {
        label: 'Link Length',
        description: 'Length of the straight middle section.',
        type: 'number',
        default: 0.6,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Internally halved to [-linkLength/2, linkLength/2].'
      },
      radiusMajor: {
        label: 'Ring Radius',
        description: 'Major radius of the rounded ends.',
        type: 'number',
        default: 0.5,
        min: 0.1,
        max: 5.0,
        step: 0.05
      },
      thickness: {
        label: 'Tube Thickness',
        description: 'Thickness / tube radius.',
        type: 'number',
        default: 0.15,
        min: 0.02,
        max: 2.0,
        step: 0.02
      }
    },
    defaultDimensions: {
      linkLength: 0.6,
      radiusMajor: 0.5,
      thickness: 0.15
    }
  },
  chamfer_cylinder: {
    type: 'chamfer_cylinder',
    name: 'Chamfered Cylinder',
    description: 'Capped cylinder with 45° beveled (chamfered) edges.',
    category: 'cad',
    fields: {
      radius: {
        label: 'Radius',
        description: 'Cylinder cross-section radius.',
        type: 'number',
        default: 0.5,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Height',
        description: 'Cylinder height.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Internally halved to [-height/2, height/2].'
      },
      chamfer: {
        label: 'Chamfer Size',
        description: 'Size of the 45-degree edge bevel.',
        type: 'number',
        default: 0.08,
        min: 0.005,
        max: 1.0,
        step: 0.01
      }
    },
    defaultDimensions: {
      radius: 0.5,
      height: 0.8,
      chamfer: 0.08
    }
  },
  egg: {
    type: 'egg',
    name: 'Egg / Ovoid',
    description: 'Asymmetric ovoid with base radius, tip radius, and height.',
    category: 'organic',
    fields: {
      baseRadius: {
        label: 'Base Radius',
        description: 'Bottom hemispherical radius.',
        type: 'number',
        default: 0.5,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      tipRadius: {
        label: 'Tip Radius',
        description: 'Top narrow radius.',
        type: 'number',
        default: 0.25,
        min: 0.02,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Height',
        description: 'Total egg height along Y.',
        type: 'number',
        default: 1.2,
        min: 0.1,
        max: 5.0,
        step: 0.05
      }
    },
    defaultDimensions: {
      baseRadius: 0.5,
      tipRadius: 0.25,
      height: 1.2
    }
  },
  heart: {
    type: 'heart',
    name: 'Heart',
    description: 'Smooth 3D extruded heart shape with scale and thickness.',
    category: 'organic',
    fields: {
      radius: {
        label: 'Scale / Size',
        description: 'Overall heart 2D scale.',
        type: 'number',
        default: 0.8,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Thickness (Half Extent)',
        description: 'Half-thickness along Z.',
        type: 'number',
        default: 0.3,
        min: 0.02,
        max: 3.0,
        step: 0.02,
        notes: 'Full thickness along Z is 2 * height.'
      }
    },
    defaultDimensions: {
      radius: 0.8,
      height: 0.3
    }
  },
  star_prism: {
    type: 'star_prism',
    name: '5-Point Star Prism',
    description: 'Extruded 5-pointed star with inner and outer radii along Z.',
    category: 'cad',
    fields: {
      outerRadius: {
        label: 'Outer Radius',
        description: 'Radius of outer star tips.',
        type: 'number',
        default: 0.75,
        min: 0.1,
        max: 5.0,
        step: 0.05
      },
      innerRadius: {
        label: 'Inner Radius',
        description: 'Radius of inner star valleys.',
        type: 'number',
        default: 0.35,
        min: 0.05,
        max: 5.0,
        step: 0.05
      },
      height: {
        label: 'Height (Half Extent)',
        description: 'Half-depth along Z axis.',
        type: 'number',
        default: 0.4,
        min: 0.05,
        max: 5.0,
        step: 0.05,
        notes: 'Full depth along Z is 2 * height (internally halved).'
      }
    },
    defaultDimensions: {
      outerRadius: 0.75,
      innerRadius: 0.35,
      height: 0.4
    }
  }
};
