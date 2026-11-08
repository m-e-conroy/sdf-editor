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
uniform vec4 uNodeDimensions[MAX_NODES];
uniform vec4 uNodeCSG[MAX_NODES];       // x: op, y: blendMode, z: k, w: roundRadius
uniform vec4 uNodeModifiers[MAX_NODES]; // x: shellThickness, y: twistFactor, z: mirrorAxis (0:none, 1:x, 2:y, 3:z)
uniform vec4 uNodeMaterials[MAX_NODES]; // xyz: color, w: roughness

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
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}

float sdSuperellipsoid(vec3 p, vec3 r, float e1, float e2) {
    vec3 q = abs(p / r);
    float t1 = pow(pow(q.x, 2.0 / e2) + pow(q.y, 2.0 / e2), e2 / e1);
    float val = pow(t1 + pow(q.z, 2.0 / e1), e1 * 0.5) - 1.0;
    return val * min(r.x, min(r.y, r.z));
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

// Coordinate Symmetry Mirror
vec3 opSymmetry(vec3 p, int axis) {
    if (axis == 1) return vec3(abs(p.x), p.y, p.z);
    if (axis == 2) return vec3(p.x, abs(p.y), p.z);
    if (axis == 3) return vec3(p.x, p.y, abs(p.z));
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
    return sdSphere(p, 0.8);
}

// Scene Distance & Material Map
struct SceneHit {
    float dist;
    vec3 color;
    float roughness;
};

SceneHit sceneMap(vec3 p) {
    float dFloor = p.y + 1.2;
    vec3 floorCol = (uThemeMode == 0) ? vec3(0.09, 0.09, 0.1) : vec3(0.92, 0.92, 0.94);

    if (uNodeCount == 0) {
        return SceneHit(dFloor, floorCol, 0.5);
    }

    // Evaluate first active node
    vec3 p0 = (uNodeInvMatrices[0] * vec4(p, 1.0)).xyz;
    if (abs(uNodeModifiers[0].y) > 0.001) p0 = opTwist(p0, uNodeModifiers[0].y);
    if (int(uNodeModifiers[0].z) > 0) p0 = opSymmetry(p0, int(uNodeModifiers[0].z));

    float dAcc = evalPrimitive(uNodeTypes[0], p0, uNodeDimensions[0]);
    if (uNodeCSG[0].w > 0.0) dAcc -= uNodeCSG[0].w; // Rounding
    if (uNodeModifiers[0].x > 0.0) dAcc = abs(dAcc) - uNodeModifiers[0].x; // Shell / Onion

    vec3 matAcc = uNodeMaterials[0].xyz;
    float roughAcc = uNodeMaterials[0].w;

    // Accumulate through CSG chain
    for (int i = 1; i < MAX_NODES; i++) {
        if (i >= uNodeCount) break;

        vec3 pNode = (uNodeInvMatrices[i] * vec4(p, 1.0)).xyz;
        if (abs(uNodeModifiers[i].y) > 0.001) pNode = opTwist(pNode, uNodeModifiers[i].y);
        if (int(uNodeModifiers[i].z) > 0) pNode = opSymmetry(pNode, int(uNodeModifiers[i].z));

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
            } else {
                if (dNode < dAcc) {
                    dAcc = dNode;
                    matAcc = uNodeMaterials[i].xyz;
                    roughAcc = uNodeMaterials[i].w;
                }
            }
        } else if (op == 1) {
            // Difference
            if (blendMode == 1) {
                dAcc = opSmoothDifference(dAcc, dNode, k);
            } else {
                dAcc = max(dAcc, -dNode);
            }
        } else if (op == 2) {
            // Intersection
            if (blendMode == 1) {
                dAcc = opSmoothIntersection(dAcc, dNode, k);
            } else {
                dAcc = max(dAcc, dNode);
            }
        }
    }

    if (dFloor < dAcc) {
        return SceneHit(dFloor, floorCol, 0.6);
    } else {
        return SceneHit(dAcc, matAcc, roughAcc);
    }
}

float map(vec3 p) {
    return sceneMap(p).dist;
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
    for (int i = 0; i < 4; i++) {
        float h = 0.01 + 0.12 * float(i) / 4.0;
        float d = map(p + h * n);
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
        float h = map(ro + rd * t);
        res = min(res, 8.0 * h / t);
        t += clamp(h, 0.02, 0.2);
        if (res < 0.02 || t > maxt) break;
    }
    return clamp(res, 0.0, 1.0);
}

// Floor Grid
float gridPattern(vec2 p) {
    vec2 coord = p * 2.0;
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = min(grid.x, grid.y);
    return 1.0 - min(line, 1.0);
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

        if (hitPos.y < -1.18) {
            // Floor Grid Rendering
            float grid = gridPattern(hitPos.xz);
            vec3 gridColor = (uThemeMode == 0) ? vec3(0.18, 0.18, 0.2) : vec3(0.85, 0.85, 0.88);
            vec3 floorBase = (uThemeMode == 0) ? vec3(0.09, 0.09, 0.1) : vec3(0.92, 0.92, 0.94);
            vec3 floorCol = mix(floorBase, gridColor, grid * 0.35);
            col = floorCol * (0.35 + 0.65 * shadowKey) * ao;
        } else {
            // ====================================================================
            // 5 Procedural Matcap Lookdev Shading Presets
            // ====================================================================
            if (uMatcapPreset == 0) {
                // Preset 0: Dark Studio Clay
                float diffKey = max(dot(normal, keyLight), 0.0);
                float diffFill = max(dot(normal, fillLight), 0.0) * 0.4;
                float diffRim = max(dot(normal, rimLight), 0.0) * 0.3;

                vec3 ambient = (uThemeMode == 0) ? vec3(0.12, 0.12, 0.14) : vec3(0.35, 0.35, 0.38);
                vec3 lighting = ambient + (diffKey * shadowKey + diffFill + diffRim) * vec3(1.0);
                col = hitInfo.color * lighting * ao;

                vec3 halfVec = normalize(keyLight - rayDir);
                float specPower = mix(64.0, 8.0, hitInfo.roughness);
                float spec = pow(max(dot(normal, halfVec), 0.0), specPower) * shadowKey;
                col += vec3(0.95, 0.75, 0.5) * spec * (1.0 - hitInfo.roughness) * 0.5;

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
        }

        float nonLinearDepth = (1.0 / tHit - 1.0 / uNear) / (1.0 / uFar - 1.0 / uNear);
        gl_FragDepth = clamp(nonLinearDepth, 0.0, 1.0);
    } else {
        gl_FragDepth = 1.0;
    }

    gl_FragColor = vec4(col, 1.0);
}
