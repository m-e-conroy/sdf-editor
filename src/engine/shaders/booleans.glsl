// ========================================================================
// SDF Studio 3D - CSG Booleans & Smooth Minimum (smin) Operators
// ========================================================================

// Standard Hard Booleans
float opUnion(float d1, float d2) {
    return min(d1, d2);
}

float opIntersection(float d1, float d2) {
    return max(d1, d2);
}

float opDifference(float d1, float d2) {
    return max(d1, -d2); // d1 minus d2
}

// Polynomial Smooth Minimum (C1 Continuous fillet with blending radius k)
float sminPolynomial(float a, float b, float k) {
    if (k <= 0.0001) return min(a, b);
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// Smooth Maximum (for smooth intersection and difference)
float smaxPolynomial(float a, float b, float k) {
    return -sminPolynomial(-a, -b, k);
}

// Smooth Difference (d1 minus d2 with smooth blend k)
float opSmoothDifference(float d1, float d2, float k) {
    return smaxPolynomial(d1, -d2, k);
}

// Smooth Intersection (d1 intersect d2 with smooth blend k)
float opSmoothIntersection(float d1, float d2, float k) {
    return smaxPolynomial(d1, d2, k);
}

// Material blend factor returning vec2(dist, blendFactor h in [0, 1])
vec2 sminMat(float a, float b, float k) {
    if (k <= 0.0001) {
        return (a < b) ? vec2(a, 1.0) : vec2(b, 0.0);
    }
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    float d = mix(b, a, h) - k * h * (1.0 - h);
    return vec2(d, h);
}
