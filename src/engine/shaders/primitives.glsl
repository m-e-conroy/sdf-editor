// ========================================================================
// SDF Studio 3D - Comprehensive GLSL Primitives Library (20+ Primitives)
// Exact and distance-bound functions derived from Inigo Quilez & distance geometry
// ========================================================================

// 1. Sphere (Exact)
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

// 2. Axis-Aligned Box (Exact)
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// 3. Rounded Box (Exact)
float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// 4. Capped Cylinder (Exact) - h: half-height, r: radius
float sdCappedCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// 5. Torus (Exact) - R: major radius, r: minor radius
float sdTorus(vec3 p, float R, float r) {
    vec2 q = vec2(length(p.xz) - R, p.y);
    return length(q) - r;
}

// 6. Capsule / Segment (Exact) - h: half-height, r: radius
float sdCapsule(vec3 p, float h, float r) {
    p.y -= clamp(p.y, -h, h);
    return length(p) - r;
}

// 7. Capped Cone (Exact) - h: half-height, r1: bottom radius, r2: top radius
float sdCappedCone(vec3 p, float h, float r1, float r2) {
    vec2 q = vec2(length(p.xz), p.y);
    vec2 k1 = vec2(r2, h);
    vec2 k2 = vec2(r2 - r1, 2.0 * h);
    vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
    vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
    float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
    return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}

// 8. Infinite Reference Plane (Exact)
float sdPlane(vec3 p, vec3 n, float h) {
    return dot(p, normalize(n)) + h;
}

// 9. Pipe / Tube (Hollow Cylinder with wall thickness)
float sdPipe(vec3 p, float h, float r, float thickness) {
    float d1 = length(p.xz) - r;
    vec2 w = vec2(abs(d1) - thickness, abs(p.y) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

// 10. Hemisphere (Exact)
float sdHemisphere(vec3 p, float r) {
    return max(length(p) - r, -p.y);
}

// 11. Ellipsoid (Bound)
float sdEllipsoid(vec3 p, vec3 r) {
    vec3 safeR = max(abs(r), vec3(0.001));
    float k0 = length(p / safeR);
    float k1 = length(p / (safeR * safeR));
    return k0 * (k0 - 1.0) / max(k1, 0.0001);
}

// 12. Superellipsoid (Bound via generalized Lp norm)
float sdSuperellipsoid(vec3 p, vec3 r, float e1, float e2) {
    vec3 safeR = max(abs(r), vec3(0.001));
    vec3 q = abs(p / safeR);
    float safeE1 = max(e1, 0.001);
    float safeE2 = max(e2, 0.001);
    float t1 = pow(pow(q.x, 2.0 / safeE2) + pow(q.y, 2.0 / safeE2), safeE2 / safeE1);
    float val = pow(t1 + pow(q.z, 2.0 / safeE1), safeE1 * 0.5) - 1.0;
    return val * min(safeR.x, min(safeR.y, safeR.z));
}

// 13. Square Pyramid (Exact)
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

// 14. Pentagonal Pyramid (Bound)
float sdPentagonalPyramid(vec3 p, float h, float r) {
    const vec3 k = vec3(0.809016994, 0.587785252, 0.726542528);
    p.xz = abs(p.xz);
    p.xz -= 2.0 * min(dot(vec2(-k.x, k.y), p.xz), 0.0) * vec2(-k.x, k.y);
    p.xz -= 2.0 * min(dot(vec2(k.x, k.y), p.xz), 0.0) * vec2(k.x, k.y);
    vec2 d = vec2(p.x - r, p.y);
    float dBase = max(p.x - r, -p.y);
    float dSlant = (dot(p.xy, vec2(h, r)) - h * r) / sqrt(h * h + r * r);
    return max(dBase, dSlant);
}

// 15. Wedge (Slanted cut box)
float sdWedge(vec3 p, vec3 b, float angle) {
    vec3 q = abs(p) - b;
    float boxDist = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    vec2 n = vec2(sin(angle), cos(angle));
    float cut = dot(p.yz, n);
    return max(boxDist, cut);
}

// 16. Cone Frustum (Truncated Cone)
float sdConeFrustum(vec3 p, float h, float r1, float r2) {
    return sdCappedCone(p, h, r1, r2);
}

// 17. Triangular Prism (Exact)
float sdTriPrism(vec3 p, vec2 h) {
    vec3 q = abs(p);
    return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
}

// 18. Pentagonal Prism (Exact)
float sdPentPrism(vec3 p, vec2 h) {
    const vec3 k = vec3(0.809016994, 0.587785252, 0.726542528);
    p.xy = abs(p.xy);
    p.xy -= 2.0 * min(dot(vec2(-k.x, k.y), p.xy), 0.0) * vec2(-k.x, k.y);
    p.xy -= 2.0 * min(dot(vec2(k.x, k.y), p.xy), 0.0) * vec2(k.x, k.y);
    vec2 d = vec2(
        length(p.xy - vec2(clamp(p.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p.y - h.x),
        p.z - h.y
    );
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// 19. Hexagonal Prism (Exact)
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

// 20. Tetrahedron (Exact Platonic Polyhedron)
float sdTetrahedron(vec3 p, float r) {
    float md = max(max(-p.x - p.y - p.z, p.x + p.y - p.z), max(-p.x + p.y + p.z, p.x - p.y + p.z));
    return (md - r) / sqrt(3.0);
}

// 21. Octahedron (Exact Platonic Polyhedron)
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

// 22. Mandelbulb 3D Fractal (Iterative Spherical Distance Estimator)
float sdMandelbulb(vec3 p, int iterations, float power) {
    vec3 w = p;
    float m = dot(w, w);
    float dz = 1.0;
    for (int i = 0; i < 6; i++) {
        if (i >= iterations) break;
        dz = power * pow(sqrt(m), power - 1.0) * dz + 1.0;
        float r = length(w);
        float b = power * acos(clamp(w.y / r, -1.0, 1.0));
        float a = power * atan(w.x, w.z);
        w = p + pow(r, power) * vec3(sin(b) * sin(a), cos(b), sin(b) * cos(a));
        m = dot(w, w);
        if (m > 256.0) break;
    }
    return 0.25 * log(m) * sqrt(m) / dz;
}

// 23. Capped Torus / Pipe Elbow (Exact) - sc: vec2(sin(th), cos(th)), ra: major radius, rb: tube radius
float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb) {
    p.x = abs(p.x);
    float k = (sc.y * p.x > sc.x * p.y) ? dot(p.xy, sc) : length(p.xy);
    return sqrt(max(dot(p, p) + ra * ra - 2.0 * ra * k, 0.0)) - rb;
}

// 24. Chain Link (Exact) - le: half-length, r1: ring radius, r2: thickness
float sdLink(vec3 p, float le, float r1, float r2) {
    vec3 q = vec3(p.x, max(abs(p.y) - le, 0.0), p.z);
    return length(vec2(length(q.xy) - r1, q.z)) - r2;
}

// 25. Chamfer Cylinder (Exact) - h: half-height, r: radius, c: chamfer width
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

// 26. Asymmetric Egg / Ovoid (Bound) - ra: base radius, rb: tip radius, h: height
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

// 27. 3D Heart (Extruded Exact 2D Cardioid) - s: scale/radius, h: half-thickness
float sdHeart(vec3 p, float s, float h) {
    s = max(s, 0.001);
    h = max(h, 0.001);
    vec2 q = vec2(p.x, p.y + 0.5 * s) / s;
    q.x = abs(q.x);

    float d2d;
    if (q.y + q.x > 1.0) {
        vec2 d1 = q - vec2(0.25, 0.75);
        d2d = sqrt(dot(d1, d1)) - 0.35355339; // sqrt(2.0)/4.0
    } else {
        vec2 dA = q - vec2(0.00, 1.00);
        vec2 dB = q - 0.5 * max(q.x + q.y, 0.0);
        d2d = sqrt(min(dot(dA, dA), dot(dB, dB))) * sign(q.x - q.y);
    }
    d2d *= s;

    vec2 w = vec2(d2d, abs(p.z) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

// 28. 5-Pointed Star Prism (Exact) - r: outer radius, rf: inner radius or factor, h: half-height
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
