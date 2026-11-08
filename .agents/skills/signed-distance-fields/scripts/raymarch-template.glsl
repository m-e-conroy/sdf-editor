// ============================================================================
// Production GLSL Sphere-Tracing (Raymarching) Template
// Derived from "Computational Distance Geometry and Visual Applications"
// Compatible with Shadertoy, Three.js ShaderMaterial, and WebGL2
// ============================================================================

#ifdef GL_ES
precision highp float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;

const int   MAX_STEPS = 128;
const float MAX_DIST  = 100.0;
const float SURF_DIST = 0.0008;

// ----------------------------------------------------------------------------
// 1. Exact 3D SDF Primitives
// ----------------------------------------------------------------------------
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

// ----------------------------------------------------------------------------
// 2. CSG & Smooth Blending Operators
// ----------------------------------------------------------------------------
float sminPolynomial(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float smaxPolynomial(float a, float b, float k) {
    return -sminPolynomial(-a, -b, k);
}

vec3 opRepeatLimited(vec3 p, float s, vec3 l) {
    return p - s * clamp(round(p / s), -l, l);
}

// ----------------------------------------------------------------------------
// 3. Scene Signed Distance Field: map(p) -> vec2(signedDistance, materialID)
// ----------------------------------------------------------------------------
vec2 map(vec3 p) {
    // Ground plane at y = -1.0
    float dFloor = p.y + 1.0;

    // Animated central organic CSG assembly
    vec3 q = p - vec3(0.0, 0.25, 0.0);
    float dBox = sdRoundBox(q, vec3(0.65), 0.12);
    float dCavity = sdSphere(q, 0.78);
    float dCarvedBox = smaxPolynomial(dBox, -dCavity, 0.08);

    vec3 orbPos = q - vec3(sin(u_time * 1.3) * 0.65, cos(u_time * 0.9) * 0.35, 0.0);
    float dOrb = sdSphere(orbPos, 0.42);
    float dCenter = sminPolynomial(dCarvedBox, dOrb, 0.28);

    // Finite-repeated background pillars
    vec3 rp = opRepeatLimited(p - vec3(0.0, 0.0, -3.5), 2.5, vec3(2.0, 0.0, 0.0));
    float dPillars = sdRoundBox(rp, vec3(0.3, 1.2, 0.3), 0.06);

    float dObjects = min(dCenter, dPillars);
    if (dFloor < dObjects) {
        return vec2(dFloor, 1.0);
    }
    return vec2(dObjects, (dCenter < dPillars) ? 2.0 : 3.0);
}

// Scalar wrapper for normals, shadows, and AO
float mapDist(vec3 p) {
    return map(p).x;
}

// ----------------------------------------------------------------------------
// 4. Sphere Tracing, Tetrahedral Normals, Soft Shadows, and Ambient Occlusion
// ----------------------------------------------------------------------------
vec2 rayMarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    float matID = -1.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + t * rd;
        vec2 hit = map(p);
        if (abs(hit.x) < SURF_DIST * (1.0 + 0.25 * t)) {
            matID = hit.y;
            break;
        }
        t += hit.x;
        if (t >= MAX_DIST) {
            matID = -1.0;
            break;
        }
    }
    return vec2(t, matID);
}

// IQ 4-Tap Tetrahedron Normal (4 evaluations instead of 6)
vec3 calcNormal(vec3 p) {
    const float h = 0.0005;
    const vec2 k = vec2(1.0, -1.0);
    return normalize(
        k.xyy * mapDist(p + k.xyy * h) +
        k.yyx * mapDist(p + k.yyx * h) +
        k.yxy * mapDist(p + k.yxy * h) +
        k.xxx * mapDist(p + k.xxx * h)
    );
}

// Triangulated SDF Penumbra Soft Shadows
float calcSoftShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    float ph = 1e10;
    for (int i = 0; i < 48; i++) {
        float h = mapDist(ro + rd * t);
        if (h < 0.0004) return 0.0;
        float y = h * h / (2.0 * ph);
        float d = sqrt(max(0.0, h * h - y * y));
        res = min(res, k * d / max(0.0001, t - y));
        ph = h;
        t += h;
        if (t >= maxt) break;
    }
    res = clamp(res, 0.0, 1.0);
    return res * res * (3.0 - 2.0 * res);
}

// 5-Tap Normal-Aligned Ambient Occlusion
float calcAO(vec3 pos, vec3 nor) {
    float occ = 0.0;
    float sca = 1.0;
    for (int i = 0; i < 5; i++) {
        float h = 0.01 + 0.12 * float(i) / 4.0;
        float d = mapDist(pos + h * nor);
        occ += (h - d) * sca;
        sca *= 0.95;
    }
    return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

// ----------------------------------------------------------------------------
// 5. Camera & Main Fragment Entrypoint
// ----------------------------------------------------------------------------
mat3 setCamera(vec3 ro, vec3 ta, float cr) {
    vec3 cw = normalize(ta - ro);
    vec3 cp = vec3(sin(cr), cos(cr), 0.0);
    vec3 cu = normalize(cross(cw, cp));
    vec3 cv = cross(cu, cw);
    return mat3(cu, cv, cw);
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;

    vec3 ro = vec3(2.4 * sin(u_time * 0.25), 1.4, 3.2 * cos(u_time * 0.25));
    vec3 ta = vec3(0.0, 0.1, 0.0);
    mat3 ca = setCamera(ro, ta, 0.0);
    vec3 rd = ca * normalize(vec3(uv, 1.8));

    vec3 col = vec3(0.07, 0.09, 0.14) - max(rd.y, 0.0) * 0.05;

    vec2 res = rayMarch(ro, rd);
    if (res.y > 0.0) {
        vec3 pos = ro + res.x * rd;
        vec3 nor = calcNormal(pos);

        // Material albedo
        vec3 mate = vec3(0.22);
        if (res.y < 1.5) {
            // Anti-aliased SDF grid lines on floor
            float grid = min(abs( fract(pos.x + 0.5) - 0.5 ), abs( fract(pos.z + 0.5) - 0.5 ));
            float line = 1.0 - smoothstep(0.0, fwidth(grid) * 1.5, grid - 0.015);
            mate = mix(vec3(0.12, 0.13, 0.16), vec3(0.24, 0.28, 0.35), line);
        } else if (res.y < 2.5) {
            mate = vec3(0.90, 0.42, 0.22);
        } else {
            mate = vec3(0.25, 0.55, 0.82);
        }

        vec3 lig = normalize(vec3(0.65, 0.75, 0.50));
        vec3 hal = normalize(lig - rd);
        float dif = clamp(dot(nor, lig), 0.0, 1.0);
        float sha = (dif > 0.001) ? calcSoftShadow(pos + nor * 0.002, lig, 0.02, 12.0, 12.0) : 0.0;
        float occ = calcAO(pos, nor);
        float spe = pow(clamp(dot(nor, hal), 0.0, 1.0), 32.0) * dif * sha;
        float sky = clamp(0.5 + 0.5 * nor.y, 0.0, 1.0);

        vec3 lin = vec3(0.0);
        lin += 2.10 * dif * sha * vec3(1.00, 0.92, 0.82);
        lin += 0.45 * sky * occ * vec3(0.35, 0.55, 0.85);
        col = mate * lin + 0.35 * spe;

        // Exponential distance fog
        col = mix(col, vec3(0.07, 0.09, 0.14), 1.0 - exp(-0.0025 * res.x * res.x));
    }

    // Gamma correction
    col = pow(max(col, 0.0), vec3(1.0 / 2.2));
    gl_FragColor = vec4(col, 1.0);
}

