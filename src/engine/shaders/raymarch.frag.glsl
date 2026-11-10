uniform vec2 uResolution;
uniform vec3 uCameraPos;
uniform mat4 uCameraWorldMatrix;
uniform mat4 uCameraInverseProj;
uniform float uNear;
uniform float uFar;
uniform float uTime;
uniform int uThemeMode; // 0 = dark, 1 = light

// Lookdev & Rendering flags
uniform int uMatcapPreset;  // 0: Dark Clay, 1: Red Wax, 2: Normal Map, 3: Chrome, 4: Sunset Horizon
uniform int uEnableShadows; // 1 = on, 0 = off
uniform int uEnableAO;      // 1 = on, 0 = off

// Dynamic Uniform Buffer CSG Array
const int MAX_NODES = 32;
uniform int uNodeCount;
uniform mat4 uNodeInvMatrices[MAX_NODES];
uniform int uNodeTypes[MAX_NODES];
uniform vec4 uNodeDimensions[MAX_NODES]; // xyz: primitive dims, w: local bounding radius incl. modifiers
uniform vec4 uNodeCSG[MAX_NODES];       // x: op, y: blendMode, z: k, w: roundRadius
uniform vec4 uNodeModifiers[MAX_NODES]; // x: shellThickness, y: twistFactor, z: symmetryMask, w: bendFactor
uniform vec4 uNodeArrayModifiers[MAX_NODES]; // x: radialRepeat, y: linearCount, z: linearSpacing, w: metalness
uniform vec4 uNodeMaterials[MAX_NODES]; // xyz: color, w: roughness
uniform float uCullMargin;              // leaves farther than this from their bound use the bound distance

const int MAX_GROUP_SKIPS = 16;
uniform vec4 uGroupBounds[MAX_GROUP_SKIPS]; // world-space sphere (xyz center, w radius) per GROUP_SKIP slot
uniform int uShowGrid;                  // 1 = on, 0 = off
uniform int uSelectedNodeIndex;         // -1 = none, 0..31 = selected node index
uniform ivec2 uSelectedRange;           // (-1, -1) if none, or (startLeaf, endLeaf)

// Postfix CSG Instructions & Stack VM
const int MAX_INSTR = 64;
uniform int uInstrCount;
uniform vec4 uInstr[MAX_INSTR]; // x: opcode (0=push_leaf, 1=combine, 2=post_mod), y: arg0, z: arg1, w: arg2

varying vec2 vUv;

const int MAX_STEPS = 128;
const float SURF_EPSILON = 0.001;
const float MAX_DIST = 80.0;

// ========================================================================
// Exact & Bound Primitives
// ========================================================================
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdCappedCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdTorus(vec3 p, float R, float r) {
    vec2 q = vec2(length(p.xz) - R, p.y);
    return length(q) - r;
}

float sdCapsule(vec3 p, float h, float r) {
    p.y -= clamp(p.y, -h, h);
    return length(p) - r;
}

float sdCappedCone(vec3 p, float h, float r1, float r2) {
    vec2 q = vec2(length(p.xz), p.y);
    vec2 k1 = vec2(r2, h);
    vec2 k2 = vec2(r2 - r1, 2.0 * h);
    vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
    vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
    float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
    return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}

float sdPipe(vec3 p, float h, float r, float thickness) {
    float d1 = length(p.xz) - r;
    vec2 w = vec2(abs(d1) - thickness, abs(p.y) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

float sdHemisphere(vec3 p, float r) {
    return max(length(p) - r, -p.y);
}

float sdEllipsoid(vec3 p, vec3 r) {
    vec3 safeR = max(abs(r), vec3(0.001));
    float k0 = length(p / safeR);
    float k1 = length(p / (safeR * safeR));
    return k0 * (k0 - 1.0) / max(k1, 0.0001);
}

float sdSuperellipsoid(vec3 p, vec3 r, float e1, float e2) {
    vec3 safeR = max(abs(r), vec3(0.001));
    vec3 q = abs(p / safeR);
    float safeE1 = max(e1, 0.001);
    float safeE2 = max(e2, 0.001);
    float t1 = pow(pow(q.x, 2.0 / safeE2) + pow(q.y, 2.0 / safeE2), safeE2 / safeE1);
    float val = pow(t1 + pow(q.z, 2.0 / safeE1), safeE1 * 0.5) - 1.0;
    return val * min(safeR.x, min(safeR.y, safeR.z));
}

float sdPyramid(vec3 p, float h) {
    float m2 = h * h + 0.25;
    p.xz = abs(p.xz);
    p.xz = (p.z > p.x) ? p.zx : p.xz;
    p.xz -= 0.5;
    vec3 q = vec3(p.z, h * p.y - 0.5 * p.x, h * p.x + 0.5 * p.y);
    float s = max(-q.x, 0.0);
    float t = clamp((q.y - 0.5 * p.z) / (m2 + 0.25), 0.0, 1.0);
    float a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
    float b = m2 * (q.x + 0.5 * t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);
    float d2 = min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : min(a, b);
    return sqrt((d2 + q.z * q.z) / m2) * sign(max(q.z, -p.y));
}

float sdHexPrism(vec3 p, vec2 h) {
    const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
    p = abs(p);
    p.xy -= 2.0 * min(dot(k.xy, p.xy), 0.0) * k.xy;
    vec2 d = vec2(
        length(p.xy - vec2(clamp(p.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p.y - h.x),
        p.z - h.y
    );
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdTriPrism(vec3 p, vec2 h) {
    vec3 q = abs(p);
    return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
}

float sdTetrahedron(vec3 p, float r) {
    float md = max(max(-p.x - p.y - p.z, p.x + p.y - p.z), max(-p.x + p.y + p.z, p.x - p.y + p.z));
    return (md - r) / sqrt(3.0);
}

float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 q;
    if (3.0 * p.x < m) q = p.xyz;
    else if (3.0 * p.y < m) q = p.yzx;
    else if (3.0 * p.z < m) q = p.zxy;
    else return m * 0.57735027;
    float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
    return length(vec3(q.x, q.y - s + k, q.z - k));
}

float sdMandelbulb(vec3 p) {
    vec3 w = p;
    float m = dot(w, w);
    float dz = 1.0;
    for (int i = 0; i < 4; i++) {
        dz = 8.0 * pow(sqrt(m), 7.0) * dz + 1.0;
        float r = length(w);
        float b = 8.0 * acos(clamp(w.y / r, -1.0, 1.0));
        float a = 8.0 * atan(w.x, w.z);
        w = p + pow(r, 8.0) * vec3(sin(b) * sin(a), cos(b), sin(b) * cos(a));
        m = dot(w, w);
        if (m > 256.0) break;
    }
    return 0.25 * log(m) * sqrt(m) / dz;
}

// 23. Capped Torus / Pipe Elbow (Exact)
float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb) {
    p.x = abs(p.x);
    float k = (sc.y * p.x > sc.x * p.y) ? dot(p.xy, sc) : length(p.xy);
    return sqrt(max(dot(p, p) + ra * ra - 2.0 * ra * k, 0.0)) - rb;
}

// 24. Chain Link (Exact)
float sdLink(vec3 p, float le, float r1, float r2) {
    vec3 q = vec3(p.x, max(abs(p.y) - le, 0.0), p.z);
    return length(vec2(length(q.xy) - r1, q.z)) - r2;
}

// 25. Chamfer Cylinder (Exact)
float sdChamferCylinder(vec3 p, float h, float r, float c) {
    if (c <= 0.0001) {
        vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
        return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
    }
    c = min(c, min(r, h));
    vec2 q = vec2(length(p.xz), abs(p.y));
    vec2 u = q - vec2(r, h);
    float dChamfer = (u.x + u.y + c) * 0.70710678;

    vec2 p0 = vec2(r - c, h);
    vec2 p1 = vec2(r, h - c);
    vec2 e = p1 - p0;
    vec2 w = q - p0;
    vec2 b = w - e * clamp(dot(w, e) / max(dot(e, e), 1e-6), 0.0, 1.0);
    float dEdge = length(b);

    float dOut;
    if (q.x > r && q.y < h - c) {
        dOut = q.x - r;
    } else if (q.y > h && q.x < r - c) {
        dOut = q.y - h;
    } else if (q.x <= r && q.y <= h && dChamfer <= 0.0) {
        dOut = 0.0;
    } else {
        dOut = dEdge;
    }

    float dIn = max(max(u.x, u.y), dChamfer);
    return (dIn > 0.0) ? dOut : dIn;
}

// 26. Asymmetric Egg / Ovoid (Bound)
float sdEgg(vec3 p, float ra, float rb, float h) {
    const float k = 1.732050808; // sqrt(3.0)
    ra = max(ra, 0.001);
    rb = max(rb, 0.001);
    float r = ra - rb;
    float sc = (abs(r) > 0.001) ? (h / (k * abs(r))) : 1.0;
    vec2 q = vec2(length(p.xz), p.y / max(sc, 0.001));
    q.x = abs(q.x);
    float d;
    if (r > 0.001) {
        d = ((q.y < 0.0) ? length(q) - r :
            (k * (q.x + r) < q.y) ? length(vec2(q.x, q.y - k * r)) :
            length(vec2(q.x + r, q.y)) - 2.0 * r) - rb;
    } else {
        float cy = clamp(q.y, 0.0, h);
        d = length(vec2(q.x, q.y - cy)) - ra;
    }
    return d * min(1.0, sc);
}

// 27. 3D Heart (Extruded Cardioid)
float sdHeart(vec3 p, float s, float h) {
    s = max(s, 0.001);
    h = max(h, 0.001);
    vec2 q = vec2(p.x, p.y + 0.5 * s) / s;
    q.x = abs(q.x);

    float d2d;
    if (q.y + q.x > 1.0) {
        vec2 d1 = q - vec2(0.25, 0.75);
        d2d = sqrt(dot(d1, d1)) - 0.35355339;
    } else {
        vec2 dA = q - vec2(0.00, 1.00);
        vec2 dB = q - 0.5 * max(q.x + q.y, 0.0);
        d2d = sqrt(min(dot(dA, dA), dot(dB, dB))) * sign(q.x - q.y);
    }
    d2d *= s;

    vec2 w = vec2(d2d, abs(p.z) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

// 28. 5-Pointed Star Prism (Exact)
float sdStar5(vec3 p, float r, float rf, float h) {
    const vec2 k1 = vec2(0.809016994375, -0.587785252292);
    const vec2 k2 = vec2(-k1.x, k1.y);

    float factor = clamp(rf > 0.0 && rf < r ? rf / r : (rf > 0.0 && rf < 1.0 ? rf : 0.5), 0.1, 0.9);

    vec2 p2 = p.xy;
    p2.x = abs(p2.x);
    p2 -= 2.0 * max(dot(k1, p2), 0.0) * k1;
    p2 -= 2.0 * max(dot(k2, p2), 0.0) * k2;
    p2.x = abs(p2.x);
    p2.y -= r;
    vec2 ba = factor * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
    float dH = clamp(dot(p2, ba) / max(dot(ba, ba), 1e-6), 0.0, r);
    float d2d = length(p2 - ba * dH) * sign(p2.y * ba.x - p2.x * ba.y);

    vec2 w = vec2(d2d, abs(p.z) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

// ========================================================================
// CSG Booleans & Smooth Operators
// ========================================================================
float sminPolynomial(float a, float b, float k) {
    if (k <= 0.0001) return min(a, b);
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float smaxPolynomial(float a, float b, float k) {
    return -sminPolynomial(-a, -b, k);
}

float opSmoothDifference(float d1, float d2, float k) {
    return smaxPolynomial(d1, -d2, k);
}

float opSmoothIntersection(float d1, float d2, float k) {
    return smaxPolynomial(d1, d2, k);
}

vec2 sminMat(float a, float b, float k) {
    if (k <= 0.0001) {
        return (a < b) ? vec2(a, 1.0) : vec2(b, 0.0);
    }
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    float d = mix(b, a, h) - k * h * (1.0 - h);
    return vec2(d, h);
}

// Coordinate Twist Modifier around Y-axis
vec3 opTwist(vec3 p, float k) {
    float c = cos(k * p.y);
    float s = sin(k * p.y);
    mat2 m = mat2(c, -s, s, c);
    return vec3(m * p.xz, p.y).xzy;
}

// Coordinate Bend Modifier in XY plane
vec3 opBend(vec3 p, float k) {
    if (abs(k) < 0.001) return p;
    float c = cos(k * p.x);
    float s = sin(k * p.x);
    mat2 m = mat2(c, -s, s, c);
    return vec3(m * p.xy, p.z);
}

// Coordinate Symmetry Mirror Mask (1: X, 2: Y, 4: Z)
vec3 opSymmetryMask(vec3 p, int mask) {
    if ((mask & 1) != 0) p.x = abs(p.x);
    if ((mask & 2) != 0) p.y = abs(p.y);
    if ((mask & 4) != 0) p.z = abs(p.z);
    return p;
}

// Polar / Radial Array Repetition around Y-axis
vec3 opPolarRepeat(vec3 p, float count) {
    if (count < 2.0) return p;
    float sector = 6.28318530718 / count;
    float angle = atan(p.z, p.x) + 0.5 * sector;
    float r = length(p.xz);
    angle = mod(angle, sector) - 0.5 * sector;
    return vec3(r * cos(angle), p.y, r * sin(angle));
}

// Bounded Linear Array Repetition along X-axis
vec3 opLinearRepeat(vec3 p, float count, float spacing) {
    if (count <= 1.0 || spacing <= 0.001) return p;
    float halfLimit = (count - 1.0) * 0.5;
    p.x = p.x - spacing * clamp(round(p.x / spacing), -halfLimit, halfLimit);
    return p;
}

// Evaluate single primitive distance
float evalPrimitive(int typeId, vec3 p, vec4 dims) {
    if (typeId == 0) return sdSphere(p, dims.x);
    if (typeId == 1) return sdBox(p, dims.xyz);
    if (typeId == 2) return sdCappedCylinder(p, dims.x, dims.y);
    if (typeId == 3) return sdTorus(p, dims.x, dims.y);
    if (typeId == 4) return sdCapsule(p, dims.x, dims.y);
    if (typeId == 5) return sdCappedCone(p, dims.x, dims.y, dims.z);
    if (typeId == 6) return sdPipe(p, dims.x, dims.y, dims.z);
    if (typeId == 7) return sdHemisphere(p, dims.x);
    if (typeId == 8) return sdEllipsoid(p, dims.xyz);
    if (typeId == 9) return sdSuperellipsoid(p, dims.xyz, 1.0, 1.0);
    if (typeId == 10) return sdPyramid(p, dims.x);
    if (typeId == 11) return sdHexPrism(p, dims.xy);
    if (typeId == 12) return sdTriPrism(p, dims.xy);
    if (typeId == 13) return sdTetrahedron(p, dims.x);
    if (typeId == 14) return sdOctahedron(p, dims.x);
    if (typeId == 15) return sdMandelbulb(p * 0.8) / 0.8;
    if (typeId == 21) return sdCappedTorus(p, vec2(sin(dims.z * 0.5), cos(dims.z * 0.5)), dims.x, dims.y);
    if (typeId == 22) return sdLink(p, dims.x, dims.y, dims.z);
    if (typeId == 23) return sdChamferCylinder(p, dims.x, dims.y, dims.z);
    if (typeId == 24) return sdEgg(p, dims.x, dims.y, dims.z);
    if (typeId == 25) return sdHeart(p, dims.x, dims.y);
    if (typeId == 26) return sdStar5(p, dims.x, dims.y, dims.z);
    return sdSphere(p, 0.8);
}

// Scene Distance & Material Map
struct SceneHit {
    float dist;
    vec3 color;
    float roughness;
    float metalness;
    int nodeIndex;
};

vec3 applyNodeDomainModifiers(vec3 p, int i) {
    // 1. Array Modifiers (Domain repetition occurs in local space before deforms)
    if (uNodeArrayModifiers[i].x >= 2.0) p = opPolarRepeat(p, uNodeArrayModifiers[i].x);
    if (uNodeArrayModifiers[i].y >= 2.0) p = opLinearRepeat(p, uNodeArrayModifiers[i].y, uNodeArrayModifiers[i].z);
    // 2. Deformation Modifiers
    if (abs(uNodeModifiers[i].y) > 0.001) p = opTwist(p, uNodeModifiers[i].y);
    if (abs(uNodeModifiers[i].w) > 0.001) p = opBend(p, uNodeModifiers[i].w);
    if (int(uNodeModifiers[i].z) > 0) p = opSymmetryMask(p, int(uNodeModifiers[i].z));
    return p;
}

SceneHit sceneMap(vec3 p) {
    float dFloor = (uShowGrid == 1) ? (p.y + 1.2) : 1e5;
    vec3 floorCol = (uThemeMode == 0) ? vec3(0.09, 0.09, 0.1) : vec3(0.92, 0.92, 0.94);

    if (uNodeCount == 0 && uInstrCount == 0) {
        return SceneHit(dFloor, floorCol, 0.5, 0.0, -1);
    }

    if (uInstrCount > 0) {
        // Stack VM evaluation for arbitrary nested CSG expressions
        const int MAX_STACK = 8;
        float sDist[MAX_STACK];
        vec3 sColor[MAX_STACK];
        float sRough[MAX_STACK];
        float sMetal[MAX_STACK];
        int sHit[MAX_STACK];
        int sp = 0;

        for (int i = 0; i < MAX_INSTR; i++) {
            if (i >= uInstrCount) break;
            vec4 instr = uInstr[i];
            int opcode = int(instr.x);

            if (opcode == 0) {
                // PUSH_LEAF: arg0 = leafIndex
                int leafIdx = int(instr.y);
                if (leafIdx < uNodeCount && sp < MAX_STACK) {
                    vec3 pNode = (uNodeInvMatrices[leafIdx] * vec4(p, 1.0)).xyz;
                    pNode = applyNodeDomainModifiers(pNode, leafIdx);

                    float dNode = evalPrimitive(uNodeTypes[leafIdx], pNode, uNodeDimensions[leafIdx]);
                    if (uNodeCSG[leafIdx].w > 0.0) dNode -= uNodeCSG[leafIdx].w; // Rounding
                    if (uNodeModifiers[leafIdx].x > 0.0) dNode = abs(dNode) - uNodeModifiers[leafIdx].x; // Shell / Onion

                    sDist[sp] = dNode;
                    sColor[sp] = uNodeMaterials[leafIdx].xyz;
                    sRough[sp] = uNodeMaterials[leafIdx].w;
                    sMetal[sp] = uNodeArrayModifiers[leafIdx].w;
                    sHit[sp] = leafIdx;
                    sp++;
                }
            } else if (opcode == 1) {
                // COMBINE: arg0 = op, arg1 = blendMode, arg2 = k
                if (sp >= 2) {
                    int bIdx = sp - 1;
                    int aIdx = sp - 2;

                    float dA = sDist[aIdx];
                    float dB = sDist[bIdx];
                    int op = int(instr.y);
                    int blendMode = int(instr.z);
                    float k = instr.w;

                    float dRes = dA;
                    vec3 colRes = sColor[aIdx];
                    float roughRes = sRough[aIdx];
                    float metalRes = sMetal[aIdx];
                    int hitRes = sHit[aIdx];

                    if (op == 0) {
                        // Union
                        if (blendMode == 1) {
                            vec2 blend = sminMat(dA, dB, k);
                            dRes = blend.x;
                            colRes = mix(sColor[bIdx], sColor[aIdx], blend.y);
                            roughRes = mix(sRough[bIdx], sRough[aIdx], blend.y);
                            metalRes = mix(sMetal[bIdx], sMetal[aIdx], blend.y);
                            hitRes = (blend.y < 0.5) ? sHit[bIdx] : sHit[aIdx];
                        } else {
                            if (dB < dA) {
                                dRes = dB;
                                colRes = sColor[bIdx];
                                roughRes = sRough[bIdx];
                                metalRes = sMetal[bIdx];
                                hitRes = sHit[bIdx];
                            }
                        }
                    } else if (op == 1) {
                        // Difference (A - B)
                        if (blendMode == 1) {
                            dRes = opSmoothDifference(dA, dB, k);
                            float h = clamp(0.5 + 0.5 * (-dB - dA) / max(k, 0.0001), 0.0, 1.0);
                            colRes = mix(sColor[aIdx], sColor[bIdx], h * 0.5);
                            roughRes = mix(sRough[aIdx], sRough[bIdx], h * 0.5);
                            metalRes = mix(sMetal[aIdx], sMetal[bIdx], h * 0.5);
                            if (-dB > dA) hitRes = sHit[bIdx];
                        } else {
                            if (-dB > dA) {
                                dRes = -dB;
                                colRes = sColor[bIdx];
                                roughRes = sRough[bIdx];
                                metalRes = sMetal[bIdx];
                                hitRes = sHit[bIdx];
                            }
                        }
                    } else if (op == 2) {
                        // Intersection (A & B)
                        if (blendMode == 1) {
                            dRes = opSmoothIntersection(dA, dB, k);
                            float h = clamp(0.5 + 0.5 * (dB - dA) / max(k, 0.0001), 0.0, 1.0);
                            colRes = mix(sColor[aIdx], sColor[bIdx], h);
                            roughRes = mix(sRough[aIdx], sRough[bIdx], h);
                            metalRes = mix(sMetal[aIdx], sMetal[bIdx], h);
                            if (dB > dA) hitRes = sHit[bIdx];
                        } else {
                            if (dB > dA) {
                                dRes = dB;
                                colRes = sColor[bIdx];
                                roughRes = sRough[bIdx];
                                metalRes = sMetal[bIdx];
                                hitRes = sHit[bIdx];
                            }
                        }
                    }

                    sDist[aIdx] = dRes;
                    sColor[aIdx] = colRes;
                    sRough[aIdx] = roughRes;
                    sMetal[aIdx] = metalRes;
                    sHit[aIdx] = hitRes;
                    sp--;
                }
            } else if (opcode == 2) {
                // POST_MOD: arg0 = roundRadius, arg1 = shellThickness
                if (sp >= 1) {
                    float rRad = instr.y;
                    float sThick = instr.z;
                    if (rRad > 0.0) sDist[sp - 1] -= rRad;
                    if (sThick > 0.0) sDist[sp - 1] = abs(sDist[sp - 1]) - sThick;
                }
            }
        }

        float finalDist = (sp > 0) ? sDist[0] : 1e5;
        vec3 finalCol = (sp > 0) ? sColor[0] : floorCol;
        float finalRough = (sp > 0) ? sRough[0] : 0.4;
        float finalMetal = (sp > 0) ? sMetal[0] : 0.0;
        int finalHit = (sp > 0) ? sHit[0] : -1;

        if (dFloor < finalDist) {
            return SceneHit(dFloor, floorCol, 0.6, 0.0, -1);
        } else {
            return SceneHit(finalDist, finalCol, finalRough, finalMetal, finalHit);
        }
    }

    // Evaluate first active node
    vec3 p0 = (uNodeInvMatrices[0] * vec4(p, 1.0)).xyz;
    p0 = applyNodeDomainModifiers(p0, 0);

    float dAcc = evalPrimitive(uNodeTypes[0], p0, uNodeDimensions[0]);
    if (uNodeCSG[0].w > 0.0) dAcc -= uNodeCSG[0].w; // Rounding
    if (uNodeModifiers[0].x > 0.0) dAcc = abs(dAcc) - uNodeModifiers[0].x; // Shell / Onion

    vec3 matAcc = uNodeMaterials[0].xyz;
    float roughAcc = uNodeMaterials[0].w;
    float metalAcc = uNodeArrayModifiers[0].w;
    int hitNodeIdx = 0;

    // Accumulate through CSG chain
    for (int i = 1; i < MAX_NODES; i++) {
        if (i >= uNodeCount) break;

        vec3 pNode = (uNodeInvMatrices[i] * vec4(p, 1.0)).xyz;
        pNode = applyNodeDomainModifiers(pNode, i);

        float dNode = evalPrimitive(uNodeTypes[i], pNode, uNodeDimensions[i]);
        if (uNodeCSG[i].w > 0.0) dNode -= uNodeCSG[i].w; // Rounding
        if (uNodeModifiers[i].x > 0.0) dNode = abs(dNode) - uNodeModifiers[i].x; // Shell / Onion

        int op = int(uNodeCSG[i].x);
        int blendMode = int(uNodeCSG[i].y);
        float k = uNodeCSG[i].z;

        if (op == 0) {
            // Union
            if (blendMode == 1) {
                vec2 blend = sminMat(dAcc, dNode, k);
                dAcc = blend.x;
                matAcc = mix(uNodeMaterials[i].xyz, matAcc, blend.y);
                roughAcc = mix(uNodeMaterials[i].w, roughAcc, blend.y);
                metalAcc = mix(uNodeArrayModifiers[i].w, metalAcc, blend.y);
                if (blend.y < 0.5) hitNodeIdx = i;
            } else {
                if (dNode < dAcc) {
                    dAcc = dNode;
                    matAcc = uNodeMaterials[i].xyz;
                    roughAcc = uNodeMaterials[i].w;
                    metalAcc = uNodeArrayModifiers[i].w;
                    hitNodeIdx = i;
                }
            }
        } else if (op == 1) {
            // Difference
            if (blendMode == 1) {
                dAcc = opSmoothDifference(dAcc, dNode, k);
            } else {
                if (-dNode > dAcc) {
                    dAcc = -dNode;
                    matAcc = uNodeMaterials[i].xyz;
                    roughAcc = uNodeMaterials[i].w;
                    metalAcc = uNodeArrayModifiers[i].w;
                    hitNodeIdx = i;
                }
            }
        } else if (op == 2) {
            // Intersection
            if (blendMode == 1) {
                dAcc = opSmoothIntersection(dAcc, dNode, k);
            } else {
                if (dNode > dAcc) {
                    dAcc = dNode;
                    matAcc = uNodeMaterials[i].xyz;
                    roughAcc = uNodeMaterials[i].w;
                    metalAcc = uNodeArrayModifiers[i].w;
                    hitNodeIdx = i;
                }
            }
        }
    }

    if (dFloor < dAcc) {
        return SceneHit(dFloor, floorCol, 0.6, 0.0, -1);
    } else {
        return SceneHit(dAcc, matAcc, roughAcc, metalAcc, hitNodeIdx);
    }
}

float evalLeafDist(int i, vec3 p, float margin) {
    vec3 pNode = (uNodeInvMatrices[i] * vec4(p, 1.0)).xyz;
    // Bounding sphere distance is a lower bound, so sphere tracing stays conservative
    float bound = length(pNode) - uNodeDimensions[i].w;
    if (bound > margin) return bound;

    pNode = applyNodeDomainModifiers(pNode, i);
    float d = evalPrimitive(uNodeTypes[i], pNode, uNodeDimensions[i]);
    if (uNodeCSG[i].w > 0.0) d -= uNodeCSG[i].w;
    if (uNodeModifiers[i].x > 0.0) d = abs(d) - uNodeModifiers[i].x;
    return d;
}

// Distance-only stack VM: same CSG semantics as sceneMap without material bookkeeping
float mapDist(vec3 p, float margin) {
    float dFloor = (uShowGrid == 1) ? (p.y + 1.2) : 1e5;
    const int MAX_STACK = 8;
    float s[MAX_STACK];
    int sp = 0;
    int skipUntil = 0;

    for (int i = 0; i < MAX_INSTR; i++) {
        if (i >= uInstrCount) break;
        if (i < skipUntil) continue;
        vec4 instr = uInstr[i];
        int opcode = int(instr.x);

        if (opcode == 3) {
            // GROUP_SKIP: a far-away group collapses to its bounding-sphere distance
            vec4 gb = uGroupBounds[int(instr.y)];
            float bound = length(p - gb.xyz) - gb.w;
            if (bound > margin && sp < MAX_STACK) {
                s[sp] = bound;
                sp++;
                skipUntil = i + 1 + int(instr.z);
            }
        } else if (opcode == 0) {
            int leafIdx = int(instr.y);
            if (leafIdx < uNodeCount && sp < MAX_STACK) {
                s[sp] = evalLeafDist(leafIdx, p, margin);
                sp++;
            }
        } else if (opcode == 1) {
            if (sp >= 2) {
                float a = s[sp - 2];
                float b = s[sp - 1];
                int op = int(instr.y);
                bool isSmooth = int(instr.z) == 1;
                float k = instr.w;
                float r;
                if (op == 0) {
                    r = isSmooth ? sminPolynomial(a, b, k) : min(a, b);
                } else if (op == 1) {
                    r = isSmooth ? opSmoothDifference(a, b, k) : max(a, -b);
                } else {
                    r = isSmooth ? opSmoothIntersection(a, b, k) : max(a, b);
                }
                s[sp - 2] = r;
                sp--;
            }
        } else if (opcode == 2) {
            if (sp >= 1) {
                if (instr.y > 0.0) s[sp - 1] -= instr.y;
                if (instr.z > 0.0) s[sp - 1] = abs(s[sp - 1]) - instr.z;
            }
        }
    }

    return min(dFloor, (sp > 0) ? s[0] : 1e5);
}

float map(vec3 p) {
    return mapDist(p, uCullMargin);
}

// IQ 4-Tap Tetrahedron Normal Calculation
vec3 calcNormal(vec3 p) {
    const float h = 0.0005;
    const vec2 k = vec2(1.0, -1.0);
    return normalize(
        k.xyy * map(p + k.xyy * h) +
        k.yyx * map(p + k.yyx * h) +
        k.yxy * map(p + k.yxy * h) +
        k.xxx * map(p + k.xxx * h)
    );
}

// Ambient Occlusion
float calcAO(vec3 p, vec3 n) {
    if (uEnableAO == 0) return 1.0;
    float occ = 0.0;
    float sca = 1.0;
    // AO samples up to ~0.13 off the surface; keep leaves within that range exact
    float margin = max(uCullMargin, 0.2);
    for (int i = 0; i < 4; i++) {
        float h = 0.01 + 0.12 * float(i) / 4.0;
        float d = mapDist(p + h * n, margin);
        occ += (h - d) * sca;
        sca *= 0.95;
    }
    return clamp(1.0 - 2.5 * occ, 0.0, 1.0);
}

// Soft Shadow
float calcShadow(vec3 ro, vec3 rd, float mint, float maxt) {
    if (uEnableShadows == 0) return 1.0;
    float res = 1.0;
    float t = mint;
    for (int i = 0; i < 24; i++) {
        // Penumbra only reads h < t/8 and steps clamp at 0.2, so culling beyond that is invisible
        float h = mapDist(ro + rd * t, max(max(uCullMargin, 0.2), t * 0.125));
        res = min(res, 8.0 * h / t);
        t += clamp(h, 0.02, 0.2);
        if (res < 0.02 || t > maxt) break;
    }
    return clamp(res, 0.0, 1.0);
}

// CAD Floor Grid with Major/Minor ticks and Origin Axis Lines
vec3 evalFloorGrid(vec2 p, vec3 floorBase, int themeMode) {
    // Major grid (1.0 unit spacing)
    vec2 grid1 = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float line1 = 1.0 - min(min(grid1.x, grid1.y), 1.0);

    // Minor grid (0.2 unit spacing)
    vec2 p5 = p * 5.0;
    vec2 grid5 = abs(fract(p5 - 0.5) - 0.5) / fwidth(p5);
    float line5 = 1.0 - min(min(grid5.x, grid5.y), 1.0);

    // Axis lines (X axis is red z=0, Z axis is blue x=0)
    float axisX = 1.0 - min(abs(p.y) / fwidth(p.y), 1.0);
    float axisZ = 1.0 - min(abs(p.x) / fwidth(p.x), 1.0);

    vec3 colMinor = (themeMode == 0) ? vec3(0.14, 0.14, 0.16) : vec3(0.85, 0.85, 0.88);
    vec3 colMajor = (themeMode == 0) ? vec3(0.25, 0.25, 0.29) : vec3(0.70, 0.70, 0.75);
    vec3 colAxisX = vec3(0.9, 0.25, 0.25);  // Red X axis line
    vec3 colAxisZ = vec3(0.25, 0.5, 0.95);  // Blue Z axis line

    // Radial distance fade
    float distFade = exp(-dot(p, p) * 0.012);

    vec3 c = floorBase;
    c = mix(c, colMinor, line5 * 0.4 * distFade);
    c = mix(c, colMajor, line1 * 0.7 * distFade);
    c = mix(c, colAxisX, axisX * 0.85 * distFade);
    c = mix(c, colAxisZ, axisZ * 0.85 * distFade);
    return c;
}

void main() {
    vec2 ndc = vUv * 2.0 - 1.0;
    vec4 clipPoint = vec4(ndc, -1.0, 1.0);
    vec4 viewPoint = uCameraInverseProj * clipPoint;
    viewPoint /= viewPoint.w;
    vec3 rayDir = normalize((uCameraWorldMatrix * vec4(viewPoint.xyz, 0.0)).xyz);
    vec3 rayOrigin = uCameraPos;

    vec3 bgBase = (uThemeMode == 0) ? vec3(0.07, 0.07, 0.08) : vec3(0.95, 0.95, 0.96);
    vec3 col = bgBase;

    float t = 0.01;
    float tHit = -1.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = rayOrigin + rayDir * t;
        float d = map(p);
        if (d < SURF_EPSILON) {
            tHit = t;
            break;
        }
        if (t > MAX_DIST) break;
        t += d * 0.95;
    }

    if (tHit > 0.0) {
        vec3 hitPos = rayOrigin + rayDir * tHit;
        vec3 normal = calcNormal(hitPos);
        float ao = calcAO(hitPos, normal);
        SceneHit hitInfo = sceneMap(hitPos);

        vec3 keyLight = normalize(vec3(1.5, 3.0, 2.0));
        vec3 fillLight = normalize(vec3(-2.0, 1.5, -1.0));
        vec3 rimLight = normalize(vec3(0.0, -1.0, -3.0));

        float shadowKey = calcShadow(hitPos + normal * 0.005, keyLight, 0.02, 8.0);

        if (hitPos.y < -1.18 && uShowGrid == 1) {
            // CAD Floor Grid Rendering
            vec3 floorBase = (uThemeMode == 0) ? vec3(0.09, 0.09, 0.1) : vec3(0.92, 0.92, 0.94);
            vec3 floorCol = evalFloorGrid(hitPos.xz, floorBase, uThemeMode);
            col = floorCol * (0.35 + 0.65 * shadowKey) * ao;
        } else {
            // ====================================================================
            // 5 Procedural Matcap Lookdev Shading Presets
            // ====================================================================
            if (uMatcapPreset == 0) {
                // Preset 0: Dark Studio Clay with PBR Metalness
                float diffKey = max(dot(normal, keyLight), 0.0);
                float diffFill = max(dot(normal, fillLight), 0.0) * 0.4;
                float diffRim = max(dot(normal, rimLight), 0.0) * 0.3;

                vec3 ambient = (uThemeMode == 0) ? vec3(0.12, 0.12, 0.14) : vec3(0.35, 0.35, 0.38);
                vec3 lighting = ambient + (diffKey * shadowKey + diffFill + diffRim) * vec3(1.0);
                
                // Diffuse attenuated by metalness (metals absorb diffuse light)
                vec3 diffuseColor = hitInfo.color * (1.0 - hitInfo.metalness * 0.85);
                col = diffuseColor * lighting * ao;

                vec3 halfVec = normalize(keyLight - rayDir);
                float specPower = mix(96.0, 6.0, hitInfo.roughness);
                float spec = pow(max(dot(normal, halfVec), 0.0), specPower) * shadowKey;
                
                // Specular tinted by albedo for metals (F0 = 0.04 for dielectric, albedo for metals)
                vec3 f0 = mix(vec3(0.04), hitInfo.color, hitInfo.metalness);
                col += f0 * spec * (1.0 - hitInfo.roughness * 0.7);

            } else if (uMatcapPreset == 1) {
                // Preset 1: Matcap Red Wax (Classic ZBrush / Sculpting Wax)
                float NdotV = clamp(dot(normal, -rayDir), 0.0, 1.0);
                vec3 baseWax = vec3(0.65, 0.14, 0.14); // Deep red
                vec3 highlightWax = vec3(0.98, 0.72, 0.55); // Warm peach
                vec3 rimWax = vec3(1.0, 0.85, 0.7);

                float diffuse = max(dot(normal, keyLight), 0.0) * 0.7 + 0.3;
                float rim = pow(1.0 - NdotV, 3.0);
                float spec = pow(max(dot(normal, normalize(keyLight - rayDir)), 0.0), 32.0);

                col = mix(baseWax * diffuse, highlightWax, pow(NdotV, 2.0) * 0.45);
                col += rimWax * rim * 0.4;
                col += vec3(1.0) * spec * 0.35 * shadowKey;
                col *= ao;

            } else if (uMatcapPreset == 2) {
                // Preset 2: World Normal Map Visualizer
                col = normal * 0.5 + 0.5;

            } else if (uMatcapPreset == 3) {
                // Preset 3: Chrome / Mirror Reflection
                vec3 refl = reflect(rayDir, normal);
                float sky = clamp(refl.y * 0.5 + 0.5, 0.0, 1.0);
                vec3 skyCol = mix(vec3(0.1, 0.1, 0.12), vec3(0.85, 0.9, 0.98), sky);
                vec3 groundCol = mix(vec3(0.05, 0.05, 0.06), vec3(0.3, 0.3, 0.35), clamp(-refl.y, 0.0, 1.0));
                vec3 env = (refl.y > 0.0) ? skyCol : groundCol;
                
                // Fresnel reflection
                float fresnel = pow(1.0 - max(dot(normal, -rayDir), 0.0), 4.0);
                col = mix(env, vec3(1.0), fresnel * 0.6) * ao;

            } else if (uMatcapPreset == 4) {
                // Preset 4: Sunset Horizon Lookdev
                float NdotL = max(dot(normal, normalize(vec3(1.0, 0.2, 1.0))), 0.0);
                vec3 sunWarm = vec3(0.98, 0.48, 0.18);  // Golden orange
                vec3 skyViolet = vec3(0.28, 0.14, 0.42); // Dusk violet
                vec3 horizonGold = vec3(1.0, 0.82, 0.45);
                
                col = mix(skyViolet, sunWarm, NdotL);
                float rim = pow(1.0 - clamp(dot(normal, -rayDir), 0.0, 1.0), 2.5);
                col += horizonGold * rim * 0.5;
                col *= ao;
            }

            // Selection Accent Contour Highlight
            bool isSelected = false;
            if (uSelectedNodeIndex >= 0 && hitInfo.nodeIndex == uSelectedNodeIndex) {
                isSelected = true;
            }
            if (uSelectedRange.x >= 0 && hitInfo.nodeIndex >= uSelectedRange.x && hitInfo.nodeIndex <= uSelectedRange.y) {
                isSelected = true;
            }
            if (isSelected) {
                float fresnelSel = pow(1.0 - max(dot(normal, -rayDir), 0.0), 3.0);
                vec3 selAccent = vec3(0.2, 0.65, 1.0); // Vibrant blue/cyan highlight
                col = mix(col, selAccent, fresnelSel * 0.65);
            }
        }

        float nonLinearDepth = (1.0 / tHit - 1.0 / uNear) / (1.0 / uFar - 1.0 / uNear);
#if defined(GL_EXT_frag_depth)
        gl_FragDepthEXT = clamp(nonLinearDepth, 0.0, 1.0);
    } else {
        gl_FragDepthEXT = 1.0;
    }
#else
        gl_FragDepth = clamp(nonLinearDepth, 0.0, 1.0);
    } else {
        gl_FragDepth = 1.0;
    }
#endif

    gl_FragColor = vec4(col, 1.0);
}
