---
name: Linear Algebra Helper
description: Helps with linear algebra tasks: inverses, linear independence, multiplicity, determinant meaning, eigenvector proofs, Gram-Schmidt, dot products, vectors.
argument-hint: "Ask a linear algebra question."
compatibility:
  - vscode
disable-model-invocation: false
license: MIT
user-invokable: true
metadata:
  triggers:
    - find the inverse
    - is this set linearly independent?
    - algebraic vs geometric multiplicity of an eigenvalue
    - what does the determinant represent geometrically
    - prove eigenvectors corresponding to distinct eigenvalues are linearly independent
    - Gram-Schmidt orthogonalization
    - help me understand dot products
    - help me with 3D graphics transforms
    - help me with my game graphics code
---

# Linear Algebra

## When to Use

Trigger when:
- Find inverses, solve linear systems, check independence.
- Compute eigenvalues/eigenvectors, dot/cross products.
- Run Gram-Schmidt, build 3D graphics matrices (MVP, look-at, projections, quaternions).

## Instructions

1. **Request Type**: Computation, conceptual, proof, graphics programming.
2. **Geometric Intuition**: Ground algebra in geometry. Explain meaning (det = volume scale).
3. **Show Work**: Walk through steps. Label multi-part steps.
4. **KaTeX**: Use math notation ($...$, $$...$$).
   - Matrices: $A, B, M$.
   - Vectors: $\mathbf{v}, \mathbf{x}, \mathbf{b}$.
   - Row ops: $R_i \leftarrow R_i + cR_j$.
   - Eigenvalues: $\lambda$.
5. **3D Graphics**: Right-to-left for column-vector convention. Note API quirks (column vs row-major).

## Topic Reference

### 1. Systems of Linear Equations

Augmented matrix $[A \mid \mathbf{b}]$. **Gauss-Jordan elimination** (RREF):
1. Find pivot column.
2. Swap rows for non-zero pivot.
3. Scale pivot to $1$.
4. Eliminate other entries in column.
5. Repeat.

**Read RREF:**
- Pivot cols → _basic variables_.
- Non-pivot cols → _free variables_.
- $[0 \cdots 0 \mid 1]$ row → **inconsistent**.
- No free variables = unique solution. Free variables = infinite solutions.

### 2. Vectors

- **Dot product**: $\mathbf{u} \cdot \mathbf{v} = \sum u_i v_i = \|\mathbf{u}\|\|\mathbf{v}\|\cos\theta$
- **Length**: $\|\mathbf{v}\| = \sqrt{\mathbf{v} \cdot \mathbf{v}}$
- **Orthogonality**: $\mathbf{u} \perp \mathbf{v} \iff \mathbf{u} \cdot \mathbf{v} = 0$
- **Cross product** ($\mathbb{R}^3$): $\mathbf{u} \times \mathbf{v} = \det\begin{bmatrix}\mathbf{i} & \mathbf{j} & \mathbf{k} \\ u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3\end{bmatrix}$ (perpendicular, sine magnitude).

### 3. Span, Linear Independence, Subspaces

- **Span**: Linear combinations $c_1\mathbf{v}_1 + \cdots + c_k\mathbf{v}_k$.
- **Linear Independence**: Only trivial solution to zero combo. Test: RREF pivot in every column.
- **Subspace**: Closed under addition and scalar multiplication.
- **Basis**: Independent spanning set. Size = **dimension**.

### 4. Matrix Algebra

- **Product**: Dot product of rows (A) and columns (B). Non-commutative.
- **Transpose**: $(A^T)_{ij} = A_{ji}$. Rule: $(AB)^T = B^T A^T$.
- **Inverse**: Exists $\iff \det(A) \neq 0$. Reduce $[A \mid I] \to [I \mid A^{-1}]$.
- **Subspaces**: $\text{null}(A)$ ($\mathbf{x}$ s.t. $A\mathbf{x} = \mathbf{0}$), $\text{col}(A)$ (column span), $\text{row}(A)$ (row span).
- **Rank–Nullity**: $\text{rank}(A) + \text{nullity}(A) = n$.

### 5. Determinants

$2 \times 2$: $ad - bc$. Larger: cofactor expansion.
- **Meaning**: Volume scale factor; sign = orientation.
- **Properties**: $\det(AB) = \det(A)\det(B)$, row swap negates sign, row addition no change.

### 6. Eigenvalues and Eigenvectors

$A\mathbf{v} = \lambda\mathbf{v}$. $A$ stretches/flips $\mathbf{v}$ by $\lambda$.
- **Characteristic polynomial**: $\det(A - \lambda I) = 0$. Roots = eigenvalues.
- **Eigenspace**: $\text{null}(A - \lambda I)$.
- **Multiplicities**: $1 \leq \text{geo}(\lambda) \leq \text{alg}(\lambda)$.

### 7. Diagonalization

$P^{-1}AP = D$ iff $A$ has $n$ independent eigenvectors.
- Columns of $P$ = eigenvectors; $D$ = eigenvalues.
- **Utility**: $A^k = PD^kP^{-1}$.

### 8. Orthogonality and Spectral Theorem

- **Orthonormal**: Orthogonal and unit length.
- **Gram-Schmidt**: Convert basis to orthonormal.
- **Spectral Theorem**: Symmetric $A = A^T$ orthogonally diagonalizable: $A = QDQ^T$. Real eigenvalues; orthogonal eigenspaces.

### 9. 2D and 3D Graphics Programming

#### Homogeneous Coordinates

Embed $\mathbb{R}^n$ in $\mathbb{R}^{n+1}$ (append 1). Directions get 0.
Cartesian recovery: divide by $w$.

#### 2D Transformations ($3 \times 3$ homogeneous)

- **Translation**: $1$s on diagonal, $(t_x, t_y)$ in last column.
- **Scaling**: $(s_x, s_y)$ on diagonal.
- **Rotation**: CCW $\cos/\sin$ matrix.
- **Arbitrary point**: $T(c) \, R(\theta) \, T(-c)$. Apply right-to-left.

#### 3D Transformations ($4 \times 4$ homogeneous)

- **Rotations**: $R_x, R_y, R_z$. CCW right-hand rule.
- **Arbitrary axis**: Rodrigues' rotation formula.
- **Cross-product matrix**: Skew-symmetric representation of $(\hat{\mathbf{n}} \times)$.

#### Pipeline Stage

Model → World → View → Clip → Divide by $w$ → NDC.
Shader MVP: `gl_Position = Projection * View * Model * Position;`

#### View Matrix (Look-At)

Build orthonormal frame $\{\mathbf{r}, \mathbf{u}, \mathbf{f}\}$ from `eye`, `at`, `up`.
$V$ maps world to camera space. Orthogonal (inverse = transpose + translation).

#### Projection Matrices

- **Orthographic**: Parallel rays; box clip planes $(l, r, b, t, n, f)$.
- **Perspective**: Divide-by-$w$ copies $-z$ to $w$ for foreshortening.

#### Normal Transform

Use **inverse transpose** of upper-left $3 \times 3$ of model matrix: $(M^{-1})^T$. Pure rotation = no cost.

#### Quaternions

Unit $q$ encodes rotation about axis $\hat{\mathbf{n}}$.
Avoids gimbal lock. Smooth interpolation via SLERP.

## Fundamental Theorem of Linear Algebra

Equivalent for $n \times n$ matrix $A$:
$\text{RREF}(A) = I$ · Invertible · Only trivial solution to $A\mathbf{x} = \mathbf{0}$ · $\det(A) \neq 0$ · $\text{rank}(A) = n$ · $0$ not an eigenvalue.

## Output Format

- **Computation**: Setup → Steps (row ops) → Result.
- **Conceptual**: Definition → Intuition → Example.
- **Proofs**: Claim → Argument → $\square$.
- **Graphics**: Pipeline stage → Matrix construction → Annotation → Code/Pitfalls.

## Examples

**Input**: Determinant geometric meaning?
**Output**: Volume scale factor. Sign = orientation. $|det(A)|$ = area/volume spanned.

## Related Skills

- **[trigonometry](../trigonometry/SKILL.md)** — Rotation, dot products, coords.
- **[geometry](../geometry/SKILL.md)** — Subspaces, projections, scaling intuition.
- **[game-math](../game-math/SKILL.md)** — Practical graphics applications.
