// ========================================================================
// SDF Studio 3D - High-Fidelity 3D Rendered Isometric Shape Iconography
// Bespoke multi-stop clay-shaded vector renders with three-point studio lighting
// ========================================================================

import { PrimitiveType } from '../tree/types';

export interface ShapeDefinition {
  type: PrimitiveType | 'group';
  name: string;
  category: 'euclidean' | 'curved' | 'polyhedra' | 'fractal' | 'cad';
  description: string;
  badge: string;
  iconSvg: string;
}

export const SHAPE_CATALOG: ShapeDefinition[] = [
  // ------------------------------------------------------------------------
  // 1. Basic Euclidean
  // ------------------------------------------------------------------------
  {
    type: 'sphere',
    name: 'Sphere',
    category: 'euclidean',
    description: 'Exact Euclidean distance sphere with uniform radius.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sphere-grad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="25%" stop-color="#cbd5e1"/>
            <stop offset="60%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </radialGradient>
          <radialGradient id="sphere-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Contact Shadow -->
        <ellipse cx="28" cy="48" rx="18" ry="4.5" fill="url(#sphere-shadow)"/>
        <!-- Sphere Body -->
        <circle cx="28" cy="26" r="19" fill="url(#sphere-grad)"/>
        <!-- Specular Hotspot -->
        <circle cx="22" cy="18" r="4.5" fill="#ffffff" fill-opacity="0.6" filter="blur(1px)"/>
      </svg>
    `
  },
  {
    type: 'box',
    name: 'Box / Cube',
    category: 'euclidean',
    description: 'Axis-aligned bounding box with separate X, Y, Z dimensions.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="box-top" x1="16" y1="12" x2="40" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="box-left" x1="10" y1="24" x2="28" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="box-right" x1="28" y1="24" x2="46" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="box-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="19" ry="4.5" fill="url(#box-shadow)"/>
        <!-- Top Face -->
        <path d="M28 10L44 19L28 28L12 19Z" fill="url(#box-top)"/>
        <!-- Left Face -->
        <path d="M12 19L28 28V45L12 36Z" fill="url(#box-left)"/>
        <!-- Right Face -->
        <path d="M28 28L44 19V36L28 45Z" fill="url(#box-right)"/>
        <!-- Highlight Edges -->
        <path d="M12 19L28 28L44 19" stroke="#ffffff" stroke-width="1" stroke-opacity="0.4"/>
        <path d="M28 28V45" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.25"/>
      </svg>
    `
  },
  {
    type: 'cylinder',
    name: 'Cylinder',
    category: 'euclidean',
    description: 'Capped circular column with variable height and radius.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cyl-top" x1="14" y1="12" x2="42" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="cyl-body" x1="14" y1="18" x2="42" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="25%" stop-color="#e2e8f0"/>
            <stop offset="70%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="cyl-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="17" ry="4" fill="url(#cyl-shadow)"/>
        <!-- Body -->
        <path d="M14 17H42V39C42 43.4 35.7 47 28 47C20.3 47 14 43.4 14 39V17Z" fill="url(#cyl-body)"/>
        <!-- Top Cap -->
        <ellipse cx="28" cy="17" rx="14" ry="5.5" fill="url(#cyl-top)"/>
        <!-- Cap Rim Highlight -->
        <ellipse cx="28" cy="17" rx="14" ry="5.5" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.5"/>
      </svg>
    `
  },
  {
    type: 'torus',
    name: 'Torus',
    category: 'euclidean',
    description: 'Smooth ring/donut with major ring radius and tube thickness.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="torus-grad" x1="8" y1="14" x2="48" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="35%" stop-color="#cbd5e1"/>
            <stop offset="70%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="torus-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="48" rx="20" ry="5" fill="url(#torus-shadow)"/>
        <!-- Torus Outer & Inner Path -->
        <path fill-rule="evenodd" clip-rule="evenodd" d="M28 12C38.5 12 47 17.8 47 25C47 32.2 38.5 38 28 38C17.5 38 9 32.2 9 25C9 17.8 17.5 12 28 12ZM28 19C33.5 19 38 21.7 38 25C38 28.3 33.5 31 28 31C22.5 31 18 28.3 18 25C18 21.7 22.5 19 28 19Z" fill="url(#torus-grad)"/>
        <!-- Specular Arch -->
        <path d="M13 22C16 16 23 14 31 14C37 14 43 17 44 21" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.6"/>
      </svg>
    `
  },
  {
    type: 'capsule',
    name: 'Capsule',
    category: 'euclidean',
    description: 'Rounded pill shape formed by line segment expansion.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cap-body" x1="16" y1="12" x2="40" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="30%" stop-color="#f8fafc"/>
            <stop offset="75%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="cap-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="15" ry="4" fill="url(#cap-shadow)"/>
        <!-- Capsule Silhouette -->
        <path d="M17 21C17 14.9 21.9 10 28 10C34.1 10 39 14.9 39 21V35C39 41.1 34.1 46 28 46C21.9 46 17 41.1 17 35V21Z" fill="url(#cap-body)"/>
        <!-- Specular Highlight Strip -->
        <path d="M23 15C22 17 22 39 22 41" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" stroke-opacity="0.65"/>
      </svg>
    `
  },
  {
    type: 'cone',
    name: 'Cone',
    category: 'euclidean',
    description: 'Capped cone tapering linearly from circular base to apex.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cone-body" x1="12" y1="30" x2="44" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="35%" stop-color="#f8fafc"/>
            <stop offset="70%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="cone-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="18" ry="4.5" fill="url(#cone-shadow)"/>
        <!-- Cone Base & Sides -->
        <path d="M28 10L43 40C43 44 36.3 47 28 47C19.7 47 13 44 13 40L28 10Z" fill="url(#cone-body)"/>
        <!-- Highlight along ridge -->
        <path d="M28 11L22 42" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.6"/>
      </svg>
    `
  },

  // ------------------------------------------------------------------------
  // 2. Curved & Hollow
  // ------------------------------------------------------------------------
  {
    type: 'pipe',
    name: 'Pipe / Tube',
    category: 'curved',
    description: 'Hollow cylinder with controllable inner bore and wall thickness.',
    badge: 'Curved',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pipe-outer" x1="12" y1="20" x2="44" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="25%" stop-color="#f1f5f9"/>
            <stop offset="75%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <linearGradient id="pipe-rim" x1="12" y1="15" x2="44" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#cbd5e1"/>
            <stop offset="50%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          </linearGradient>
          <radialGradient id="pipe-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="17" ry="4" fill="url(#pipe-shadow)"/>
        <!-- Outer Shell -->
        <path d="M13 18H43V38C43 43 36.3 47 28 47C19.7 47 13 43 13 38V18Z" fill="url(#pipe-outer)"/>
        <!-- Top Outer Rim -->
        <ellipse cx="28" cy="18" rx="15" ry="6" fill="url(#pipe-rim)"/>
        <!-- Inner Bore (Dark Interior Hole) -->
        <ellipse cx="28" cy="18" rx="9" ry="3.6" fill="#0f172a"/>
      </svg>
    `
  },
  {
    type: 'hemisphere',
    name: 'Hemisphere',
    category: 'curved',
    description: 'Half sphere planar-cut across the equator.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hemi-dome" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="30%" stop-color="#cbd5e1"/>
            <stop offset="70%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </radialGradient>
          <linearGradient id="hemi-base" x1="10" y1="36" x2="46" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="50%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
          <radialGradient id="hemi-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="48" rx="18" ry="4.5" fill="url(#hemi-shadow)"/>
        <!-- Upper Dome -->
        <path d="M10 36C10 23.8 18.1 14 28 14C37.9 14 46 23.8 46 36H10Z" fill="url(#hemi-dome)"/>
        <!-- Flat Circular Base Cut -->
        <ellipse cx="28" cy="36" rx="18" ry="5.5" fill="url(#hemi-base)"/>
        <path d="M15 28C17 20 22 16 28 15" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.5"/>
      </svg>
    `
  },
  {
    type: 'ellipsoid',
    name: 'Ellipsoid',
    category: 'curved',
    description: 'Smooth quadratic oval with independent tri-axial radii (X/Y/Z).',
    badge: 'Curved',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ellip-grad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="25%" stop-color="#cbd5e1"/>
            <stop offset="65%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </radialGradient>
          <radialGradient id="ellip-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="19" ry="4" fill="url(#ellip-shadow)"/>
        <!-- Stretched Oval Body -->
        <ellipse cx="28" cy="27" rx="20" ry="14" fill="url(#ellip-grad)"/>
        <!-- Soft Specular Reflection -->
        <ellipse cx="22" cy="21" rx="6" ry="3.5" fill="#ffffff" fill-opacity="0.55" transform="rotate(-15 22 21)"/>
      </svg>
    `
  },

  // ------------------------------------------------------------------------
  // 3. Polyhedra & Prisms
  // ------------------------------------------------------------------------
  {
    type: 'pyramid',
    name: 'Square Pyramid',
    category: 'polyhedra',
    description: 'Classic 4-sided pyramid with square base and sharp apex.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pyr-left" x1="28" y1="10" x2="11" y2="43" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
          <linearGradient id="pyr-right" x1="28" y1="10" x2="45" y2="43" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="pyr-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="48" rx="18" ry="4.5" fill="url(#pyr-shadow)"/>
        <!-- Left Face -->
        <path d="M28 10L11 40L28 45Z" fill="url(#pyr-left)"/>
        <!-- Right Face -->
        <path d="M28 10L28 45L45 40Z" fill="url(#pyr-right)"/>
        <!-- Center Crease Highlight -->
        <path d="M28 10V45" stroke="#ffffff" stroke-width="0.9" stroke-opacity="0.45"/>
      </svg>
    `
  },
  {
    type: 'hexagonal_prism',
    name: 'Hex Prism',
    category: 'polyhedra',
    description: 'Extruded hexagonal column with faceted polygonal edges.',
    badge: 'Polyhedron',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hex-top" x1="14" y1="12" x2="42" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="hex-f1" x1="12" y1="20" x2="20" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="hex-f2" x1="20" y1="20" x2="36" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
          <linearGradient id="hex-f3" x1="36" y1="20" x2="44" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="hex-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="18" ry="4" fill="url(#hex-shadow)"/>
        <!-- Top Hexagon Face -->
        <path d="M28 10L42 16L42 22L28 28L14 22L14 16Z" fill="url(#hex-top)"/>
        <!-- 3 Visible Vertical Faces -->
        <path d="M14 22L28 28V45L14 39Z" fill="url(#hex-f1)"/>
        <path d="M28 28L36 25V42L28 45Z" fill="url(#hex-f2)"/>
        <path d="M36 25L42 22V39L36 42Z" fill="url(#hex-f3)"/>
      </svg>
    `
  },
  {
    type: 'triangular_prism',
    name: 'Tri Prism',
    category: 'polyhedra',
    description: 'Extruded prism with equilateral triangular profile.',
    badge: 'Polyhedron',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tri-top" x1="12" y1="12" x2="44" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="tri-left" x1="12" y1="20" x2="28" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="tri-right" x1="28" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="tri-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="48" rx="17" ry="4" fill="url(#tri-shadow)"/>
        <!-- Top Triangular Face -->
        <path d="M28 10L44 22L12 22Z" fill="url(#tri-top)"/>
        <!-- Left Side Face -->
        <path d="M12 22L28 28V45L12 39Z" fill="url(#tri-left)"/>
        <!-- Right Side Face -->
        <path d="M28 28L44 22V39L28 45Z" fill="url(#tri-right)"/>
        <path d="M28 28V45" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.3"/>
      </svg>
    `
  },
  {
    type: 'tetrahedron',
    name: 'Tetrahedron',
    category: 'polyhedra',
    description: 'Four-sided regular polyhedron with triangular facets.',
    badge: 'Polyhedron',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tet-left" x1="28" y1="10" x2="12" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
          <linearGradient id="tet-right" x1="28" y1="10" x2="44" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="tet-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="48" rx="16" ry="4" fill="url(#tet-shadow)"/>
        <!-- Left Facet -->
        <path d="M28 10L12 38L28 44Z" fill="url(#tet-left)"/>
        <!-- Right Facet -->
        <path d="M28 10L28 44L44 38Z" fill="url(#tet-right)"/>
        <!-- Base Ridge Highlight -->
        <path d="M12 38L28 44L44 38" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.3"/>
      </svg>
    `
  },
  {
    type: 'octahedron',
    name: 'Octahedron',
    category: 'polyhedra',
    description: 'Eight-sided regular dual-pyramid jewel polyhedron.',
    badge: 'Polyhedron',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="oct-top-l" x1="28" y1="9" x2="12" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          </linearGradient>
          <linearGradient id="oct-top-r" x1="28" y1="9" x2="44" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="oct-bot-l" x1="12" y1="28" x2="28" y2="47" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
          <linearGradient id="oct-bot-r" x1="44" y1="28" x2="28" y2="47" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="oct-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="16" ry="4" fill="url(#oct-shadow)"/>
        <!-- Top Left Facet -->
        <path d="M28 9L12 28L28 32Z" fill="url(#oct-top-l)"/>
        <!-- Top Right Facet -->
        <path d="M28 9L28 32L44 28Z" fill="url(#oct-top-r)"/>
        <!-- Bottom Left Facet -->
        <path d="M12 28L28 47L28 32Z" fill="url(#oct-bot-l)"/>
        <!-- Bottom Right Facet -->
        <path d="M44 28L28 32L28 47Z" fill="url(#oct-bot-r)"/>
        <!-- Equator Rim Line -->
        <path d="M12 28L28 32L44 28" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4"/>
      </svg>
    `
  },

  // ------------------------------------------------------------------------
  // 4. 3D Fractals
  // ------------------------------------------------------------------------
  {
    type: 'mandelbulb',
    name: 'Mandelbulb',
    category: 'fractal',
    description: 'Iterative 3D Mandelbrot fractal construct using spherical coordinates.',
    badge: 'Fractal',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mb-core" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="25%" stop-color="#cbd5e1"/>
            <stop offset="65%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </radialGradient>
          <radialGradient id="mb-lobe" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#e2e8f0"/>
            <stop offset="50%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </radialGradient>
          <radialGradient id="mb-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="28" cy="49" rx="19" ry="4.5" fill="url(#mb-shadow)"/>
        <!-- Main Core -->
        <circle cx="28" cy="27" r="14" fill="url(#mb-core)"/>
        <!-- Multi-Lobe Fractal Nodes -->
        <circle cx="16" cy="23" r="6.5" fill="url(#mb-lobe)"/>
        <circle cx="40" cy="23" r="6.5" fill="url(#mb-lobe)"/>
        <circle cx="28" cy="15" r="6.5" fill="url(#mb-lobe)"/>
        <circle cx="21" cy="35" r="6" fill="url(#mb-lobe)"/>
        <circle cx="35" cy="35" r="6" fill="url(#mb-lobe)"/>
        <!-- Tertiary Micro-Bulbs -->
        <circle cx="12" cy="18" r="3" fill="#cbd5e1"/>
        <circle cx="44" cy="18" r="3" fill="#94a3b8"/>
        <circle cx="28" cy="9" r="3" fill="#ffffff" fill-opacity="0.8"/>
      </svg>
    `
  },

  // ------------------------------------------------------------------------
  // 5. Advanced Mechanical CAD & Stylized Organic Shapes
  // ------------------------------------------------------------------------
  {
    type: 'capped_torus',
    name: 'Pipe Elbow',
    category: 'curved',
    description: 'Quarter-turn 90-degree curved elbow pipe with circular end caps.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="elbow-body" x1="12" y1="18" x2="38" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="25%" stop-color="#cbd5e1"/>
            <stop offset="65%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <linearGradient id="elbow-cap-top" x1="11.5" y1="17" x2="24.5" y2="17" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="elbow-cap-side" x1="39" y1="31.5" x2="39" y2="44.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
          <radialGradient id="elbow-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Contact Shadow -->
        <ellipse cx="28" cy="49" rx="19" ry="4" fill="url(#elbow-shadow)"/>
        <!-- Torus Arc Body -->
        <path d="M 11.5 17 C 11.5 32.2 23.8 44.5 39 44.5 L 39 31.5 C 31 31.5 24.5 25 24.5 17 Z" fill="url(#elbow-body)"/>
        <!-- Side Circular Cap -->
        <ellipse cx="39" cy="38" rx="3.5" ry="6.5" fill="url(#elbow-cap-side)"/>
        <ellipse cx="39" cy="38" rx="3.5" ry="6.5" stroke="#ffffff" stroke-width="0.7" stroke-opacity="0.35"/>
        <!-- Top Circular Cap -->
        <ellipse cx="18" cy="17" rx="6.5" ry="3.5" fill="url(#elbow-cap-top)"/>
        <ellipse cx="18" cy="17" rx="6.5" ry="3.5" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.5"/>
        <!-- Specular Ridge Highlight -->
        <path d="M 14.5 17 C 14.5 29.5 24.5 39.5 37 39.5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.6"/>
      </svg>
    `
  },
  {
    type: 'chain_link',
    name: 'Chain Link',
    category: 'curved',
    description: 'Elongated torus ring formed by two semicircles joined by straight cylindrical struts.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="link-body" x1="10" y1="16" x2="46" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="25%" stop-color="#cbd5e1"/>
            <stop offset="65%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <radialGradient id="link-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Contact Shadow -->
        <ellipse cx="28" cy="48" rx="20" ry="4.5" fill="url(#link-shadow)"/>
        <!-- Elongated Torus Body with Void -->
        <path fill-rule="evenodd" clip-rule="evenodd" d="M 20 14 H 36 C 42.5 14 47 19.8 47 27 C 47 34.2 42.5 40 36 40 H 20 C 13.5 40 9 34.2 9 27 C 9 19.8 13.5 14 20 14 Z M 22 22 H 34 C 37.5 22 40 24.2 40 27 C 40 29.8 37.5 32 34 32 H 22 C 18.5 32 16 29.8 16 27 C 16 24.2 18.5 22 22 22 Z" fill="url(#link-body)"/>
        <!-- Inner Void Depth Shadow -->
        <path d="M 16 27 C 16 24.2 18.5 22 22 22 H 34 C 37.5 22 40 24.2 40 27 C 39 25 36 24 34 24 H 22 C 19 24 17 25.5 16 27 Z" fill="#334155" fill-opacity="0.5"/>
        <!-- Top Strut Specular Highlight -->
        <path d="M 19 16 H 37" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-opacity="0.65"/>
        <!-- Arch Bend Specular Highlight -->
        <path d="M 13 23 C 13 18 16 16 20 16" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.6"/>
        <!-- Bottom Outer Rim Subtle Reflection -->
        <path d="M 11 29 C 12 35 16 38 22 38" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" stroke-opacity="0.3"/>
      </svg>
    `
  },
  {
    type: 'chamfer_cylinder',
    name: 'Chamfer Cylinder',
    category: 'euclidean',
    description: 'Capped cylinder with 45-degree beveled edges along top and bottom rims.',
    badge: 'Exact',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chamfer-top" x1="17.5" y1="10" x2="38.5" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="chamfer-bevel-top" x1="13" y1="13" x2="43" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="40%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
          <linearGradient id="chamfer-body" x1="13" y1="28" x2="43" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="25%" stop-color="#e2e8f0"/>
            <stop offset="70%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <linearGradient id="chamfer-bevel-bot" x1="13" y1="40" x2="43" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="50%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <radialGradient id="chamfer-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Contact Shadow -->
        <ellipse cx="28" cy="49" rx="17" ry="4" fill="url(#chamfer-shadow)"/>
        <!-- Main Cylinder Body -->
        <path d="M 13 18 H 43 V 38 C 43 42 35.5 45 28 45 C 20.5 45 13 42 13 38 Z" fill="url(#chamfer-body)"/>
        <!-- Bottom Chamfer Bevel Ring -->
        <path d="M 13 38 L 17.5 43 C 22 45.8 34 45.8 38.5 43 L 43 38 C 43 42 35.5 45 28 45 C 20.5 45 13 42 13 38 Z" fill="url(#chamfer-bevel-bot)"/>
        <!-- Top Chamfer Bevel Transition Band -->
        <path d="M 13 18 C 13 22 43 22 43 18 L 38.5 13 C 38.5 9.5 17.5 9.5 17.5 13 Z" fill="url(#chamfer-bevel-top)"/>
        <!-- Top Planar Cap -->
        <ellipse cx="28" cy="13" rx="10.5" ry="4" fill="url(#chamfer-top)"/>
        <ellipse cx="28" cy="13" rx="10.5" ry="4" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.6"/>
        <!-- Bevel Shoulder Crease Highlight -->
        <path d="M 13 18 C 13 22 43 22 43 18" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4"/>
        <!-- Body Specular Strip -->
        <path d="M 21 18 V 38" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.5"/>
      </svg>
    `
  },
  {
    type: 'egg',
    name: 'Egg / Ovoid',
    category: 'curved',
    description: 'Smooth asymmetric egg tapering upward from a bulbous base to a narrower rounded tip.',
    badge: 'Curved',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="egg-grad" cx="34%" cy="28%" r="68%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="25%" stop-color="#cbd5e1"/>
            <stop offset="60%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </radialGradient>
          <radialGradient id="egg-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Contact Shadow -->
        <ellipse cx="28" cy="48" rx="17" ry="4" fill="url(#egg-shadow)"/>
        <!-- Asymmetric Egg Silhouette -->
        <path d="M 28 10 C 23.5 10 13 21 13 33 C 13 41.5 19.5 45.5 28 45.5 C 36.5 45.5 43 41.5 43 33 C 43 21 32.5 10 28 10 Z" fill="url(#egg-grad)"/>
        <!-- Soft Specular Reflection -->
        <ellipse cx="23" cy="22" rx="4.5" ry="6" fill="#ffffff" fill-opacity="0.55" transform="rotate(-18 23 22)"/>
        <!-- Secondary Specular Hotspot -->
        <circle cx="21" cy="19" r="2" fill="#ffffff" fill-opacity="0.75"/>
        <!-- Rim Lighting Accent -->
        <path d="M 14.5 35 C 16 41 21 44 27 44.5" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" stroke-opacity="0.3"/>
      </svg>
    `
  },
  {
    type: 'heart',
    name: '3D Heart',
    category: 'curved',
    description: 'Volumetric heart with dual rounded lobes, center cleft, tapering point, and extruded depth.',
    badge: 'Stylized',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heart-front" x1="18" y1="12" x2="38" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fda4af"/>
            <stop offset="25%" stop-color="#f43f5e"/>
            <stop offset="65%" stop-color="#e11d48"/>
            <stop offset="100%" stop-color="#9f1239"/>
          </linearGradient>
          <linearGradient id="heart-side" x1="28" y1="43" x2="46" y2="23" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#881337"/>
            <stop offset="100%" stop-color="#4c0519"/>
          </linearGradient>
          <radialGradient id="heart-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4c0519" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Contact Shadow -->
        <ellipse cx="28" cy="48" rx="16" ry="4" fill="url(#heart-shadow)"/>
        <!-- 3D Lateral Extrusion Thickness -->
        <path d="M 28 43 L 29.5 45.5 C 37 40 48 32 46.5 23.5 L 44 21 C 46 30 35 38 28 43 Z" fill="url(#heart-side)"/>
        <!-- Front Volumetric Heart Face -->
        <path d="M 28 17 C 25.5 12 14 11 12 21 C 10 30 21 38 28 43 C 35 38 46 30 44 21 C 42 11 30.5 12 28 17 Z" fill="url(#heart-front)"/>
        <!-- Left Lobe Specular Ridge -->
        <path d="M 15 15 C 19 12.5 24 14 26 17" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-opacity="0.65"/>
        <!-- Right Lobe Specular Hotspot -->
        <ellipse cx="37" cy="16" rx="3.5" ry="2" fill="#ffffff" fill-opacity="0.5" transform="rotate(-20 37 16)"/>
        <!-- Center Cleft Depth Accent -->
        <path d="M 28 17 V 23" stroke="#881337" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.4"/>
      </svg>
    `
  },
  {
    type: 'star_prism',
    name: 'Star Prism',
    category: 'polyhedra',
    description: 'Extruded five-pointed star prism with faceted edge geometry and planar top cap.',
    badge: 'Polyhedron',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="star-top" x1="12" y1="7" x2="44" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="star-f1" x1="12" y1="15" x2="21" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          </linearGradient>
          <linearGradient id="star-f2" x1="18" y1="21" x2="21" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
          <linearGradient id="star-f3" x1="18" y1="28" x2="28" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="star-f4" x1="28" y1="23" x2="38" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
          <linearGradient id="star-f5" x1="35" y1="21" x2="38" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <linearGradient id="star-f6" x1="35" y1="15" x2="44" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <radialGradient id="star-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Contact Shadow -->
        <ellipse cx="28" cy="49" rx="19" ry="4" fill="url(#star-shadow)"/>
        <!-- 6 Visible Extruded Side Facets -->
        <path d="M 12 15 L 21 21 V 37 L 12 31 Z" fill="url(#star-f1)"/>
        <path d="M 21 21 L 18 28 V 44 L 21 37 Z" fill="url(#star-f2)"/>
        <path d="M 18 28 L 28 23 V 39 L 18 44 Z" fill="url(#star-f3)"/>
        <path d="M 28 23 L 38 28 V 44 L 28 39 Z" fill="url(#star-f4)"/>
        <path d="M 38 28 L 35 21 V 37 L 38 44 Z" fill="url(#star-f5)"/>
        <path d="M 35 21 L 44 15 V 31 L 35 37 Z" fill="url(#star-f6)"/>
        <!-- Top Planar 5-Pointed Star Face -->
        <path d="M 28 7 L 33 14 L 44 15 L 35 21 L 38 28 L 28 23 L 18 28 L 21 21 L 12 15 L 23 14 Z" fill="url(#star-top)"/>
        <!-- Facet Crease & Bevel Ridge Lines -->
        <path d="M 18 28 L 28 23 L 38 28" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4"/>
        <path d="M 18 28 V 44" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4"/>
        <path d="M 38 28 V 44" stroke="#ffffff" stroke-width="0.7" stroke-opacity="0.25"/>
        <path d="M 28 23 V 39" stroke="#000000" stroke-width="0.7" stroke-opacity="0.3"/>
      </svg>
    `
  },
  // ------------------------------------------------------------------------
  // 5. CAD Assembly & CSG Groups
  // ------------------------------------------------------------------------
  {
    type: 'group',
    name: 'CSG Group',
    category: 'cad',
    description: 'Hierarchical CSG container node evaluating nested (A - B) boolean subtrees.',
    badge: 'Assembly',
    iconSvg: `
      <svg viewBox="0 0 56 56" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="group-bg-grad" x1="12" y1="12" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
          </linearGradient>
          <radialGradient id="group-sphere-a" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#e0f2fe"/>
            <stop offset="40%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0369a1"/>
          </radialGradient>
          <radialGradient id="group-sphere-b" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="40%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#334155"/>
          </radialGradient>
          <radialGradient id="group-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Contact Shadow -->
        <ellipse cx="28" cy="48" rx="20" ry="4" fill="url(#group-shadow)"/>
        <!-- Dashed Bounding Bracket Container -->
        <rect x="8" y="8" width="40" height="40" rx="8" fill="url(#group-bg-grad)" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" stroke-opacity="0.8"/>
        <!-- Left Primary Sphere -->
        <circle cx="22" cy="27" r="11" fill="url(#group-sphere-b)"/>
        <!-- Right CSG Subtracted / Joined Sphere -->
        <circle cx="34" cy="29" r="10" fill="url(#group-sphere-a)" fill-opacity="0.9"/>
        <!-- Specular glints -->
        <circle cx="19" cy="23" r="2.5" fill="#ffffff" fill-opacity="0.7"/>
        <circle cx="31" cy="25" r="2" fill="#ffffff" fill-opacity="0.9"/>
      </svg>
    `
  }
];

