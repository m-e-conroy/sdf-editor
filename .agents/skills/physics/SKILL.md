---
name: physics
description: Physics/calculus for real-time sims: Newtonian mechanics, numerical integration, rigid bodies, constraints, SPH fluids, soft bodies (spring-mass, PBD), particle systems. Use for physics engines, force/motion simulation, diff eqs in code, gravity/collisions/friction, Euler/Verlet/RK4, cloth/rope, fluid sims, time-stepped simulation. Trigger: "simulate", "add gravity", "spring force", "damping", "timestep", "integrate velocity", "soft body", "fluid sim", "particle physics", "F=ma". Refs: geometry, trigonometry, linear-algebra.
---

# Physics & Calculus

## When to Use

Physics engines, force/motion simulation, differential equations in code, gravity/collisions/friction, Euler/Verlet/RK4 integration, cloth/rope, SPH fluids, time-stepped simulation, physically-based animation.

## Instructions

1. **Identify Domain**: Rigid body, soft body (spring-mass, PBD), fluids, kinematics.
2. **Select Integration**: 
   - Semi-Implicit Euler: standard game objects.
   - Verlet/PBD: soft bodies, cloth, ropes.
   - RK4: orbital mechanics, high-precision simulators.
3. **Accumulate Forces/Impulses**: Calculate net force/impulse before updating state.
4. **Decouple Timestep**: Use fixed timestep accumulator for stability, decoupled from render frame rate.
5. **Enforce Conservation**: Ensure integration loop does not gain energy (avoid Forward Euler for stiff springs).

## Output Format

1. **Physical Model**: Forces, constraints, differential equations.
2. **Integration Strategy**: Chosen method + mathematical rationale.
3. **Implementation**: Code/pseudocode with commented math formulas.
4. **Stability**: Instability risks (stiff springs, large dt) + mitigation.

---

## Differential Equations in Code

Discrete time steps ($\Delta t$) approximate continuous change:

$$\frac{d\vec{x}}{dt} = \vec{v} \qquad \frac{d\vec{v}}{dt} = \frac{\vec{F}}{m} = \vec{a}$$

**Core update loop:**

```
LOOP every frame:
  1. Accumulate forces acting on each body
  2. Compute acceleration:  a ← F_total / mass
  3. Integrate: advance position and velocity by Δt
  4. Resolve constraints and collisions
  5. Clear accumulated forces
END
```

---

## Numerical Integration Methods

### Explicit (Forward) Euler — Unstable

```
velocity ← velocity + acceleration * dt
position ← position + velocity * dt
```

**Use**: Prototyping, small dt. 
**Avoid**: Springs (gains energy/explodes).

---

### Semi-Implicit (Symplectic) Euler — Standard

Update velocity first, then position:

```
velocity ← velocity + acceleration * dt
position ← position + velocity * dt    // uses NEW velocity
```

Energy-conserving. Standard for game physics.

---

### Verlet Integration — Constraint-Friendly

Stores previous position; velocity is implicit:

```
// Each body stores: position_current, position_previous
acceleration ← F_total / mass
position_next ← 2 * position_current - position_previous + acceleration * dt²
position_previous ← position_current
position_current  ← position_next
```

Derive velocity when needed:

```
velocity ← (position_current - position_previous) / (2 * dt)
```

**Strengths**: Velocity is correct after hard position corrections. 2nd-order, time-reversible.
**Weakness**: Drag calculation requires care.

---

### RK4 — Precision Systems

```
FUNCTION rk4_step(state, dt) → state
  k1 ← derivative(state)
  k2 ← derivative(state + k1 * dt/2)
  k3 ← derivative(state + k2 * dt/2)
  k4 ← derivative(state + k3 * dt)
  RETURN state + (k1 + 2*k2 + 2*k3 + k4) * (dt / 6)
END
```

**Use**: Orbital mechanics, ballistics. 
**Cost**: 4x evaluation overhead compared to Euler.

---

## Newtonian Mechanics

### Forces & Net Accumulation

$$\vec{F}_{net} = m\vec{a}$$

```
FUNCTION accumulate_forces(body) → vec3
  F ← ZERO_VECTOR
  F ← F + vec3(0, -9.81 * body.mass, 0) // Gravity
  F ← F + body.velocity * (-body.drag_coefficient) // Drag
  F ← F + body.accumulated_external_forces
  RETURN F
END
```

### Kinematics Reference

| Equation                              | Meaning                                     |
| ------------------------------------- | ------------------------------------------- |
| $v = v_0 + at$                        | Velocity after constant acceleration        |
| $x = x_0 + v_0 t + \frac{1}{2}at^2$   | Displacement under constant acceleration    |
| $v^2 = v_0^2 + 2a\Delta x$            | Velocity from displacement (no time)        |
| $\vec{p} = m\vec{v}$                  | Linear momentum                             |
| $\vec{J} = \Delta\vec{p} = F\Delta t$ | Impulse = change in momentum                |

---

## Rigid Body Dynamics

Angular simulation requires tensors and cross products (refs: **linear-algebra**, **geometry**).

### Linear Part

```
body.acceleration ← accumulate_forces(body) / body.mass
body.velocity     ← body.velocity + body.acceleration * dt
body.position     ← body.position + body.velocity * dt
```

### Angular Part

```
// L = I * ω; τ = r × F
angular_acceleration ← body.inertia_tensor_inv * accumulate_torques(body)
body.angular_velocity ← body.angular_velocity + angular_acceleration * dt

// Integrate orientation quaternion
delta_q ← quaternion_from_axis_angle(
  normalise(body.angular_velocity),
  magnitude(body.angular_velocity) * dt
)
body.orientation orientation ← normalise(delta_q * body.orientation)
```

### Collision Response — Impulse-Based

```
FUNCTION resolve_collision(A, B, contact_normal, restitution)
  relative_velocity ← A.velocity - B.velocity
  velocity_along_normal ← dot(relative_velocity, contact_normal)
  IF velocity_along_normal > 0 THEN RETURN

  e  ← restitution
  j  ← -(1 + e) * velocity_along_normal
  j  ← j / (1 / A.mass + 1 / B.mass)

  impulse ← contact_normal * j
  A.velocity ← A.velocity + impulse / A.mass
  B.velocity ← B.velocity - impulse / B.mass

  // Positional correction (resolve sinking)
  correction_percent ← 0.2; slop ← 0.01
  correction ← max(penetration_depth - slop, 0) / (1/A.mass + 1/B.mass)
               * correction_percent * contact_normal
  A.position ← A.position + correction / A.mass
  B.position ← B.position - correction / B.mass
END
```

---

## Spring Systems

Hooke's Law with damping: $\vec{F} = -k\Delta x - c\vec{v}_{rel}$

```
FUNCTION spring_force(A, B, rest_length, stiffness, damping) → vec3
  delta ← B.position - A.position; dist ← magnitude(delta)
  direction ← delta / dist
  extension ← dist - rest_length
  relative_vel ← dot(B.velocity - A.velocity, direction)
  force_magnitude ← stiffness * extension + damping * relative_vel
  RETURN direction * force_magnitude
END
```

**Stability**: Stiff springs ($k$ large) require small $\Delta t$ or implicit integration.

---

## Soft Bodies

### Spring-Mass Mesh

```
FUNCTION spring_mass_update(mesh, dt)
  FOR each vertex v IN mesh.vertices DO v.force ← vec3(0, -9.81 * v.mass, 0) END
  FOR each spring s IN mesh.springs DO
    f ← spring_force(s.vertex_a, s.vertex_b, s.rest_length, s.stiffness, s.damping)
    s.vertex_a.force ← s.vertex_a.force + f
    s.vertex_b.force ← s.vertex_b.force - f
  END
  FOR each vertex v IN mesh.vertices DO
    IF v.is_pinned THEN CONTINUE
    v.velocity ← v.velocity + (v.force / v.mass) * dt
    v.position ← v.position + v.velocity * dt
  END
END
```

---

### Position-Based Dynamics (PBD)

Corrects positions to satisfy constraints, then derives velocities. Excellent for cloth.

```
FUNCTION pbd_update(particles, constraints, dt, iterations)
  FOR each particle p DO
    p.velocity ← p.velocity + external_acceleration(p) * dt
    p.position_predicted ← p.position + p.velocity * dt
  END
  FOR iter FROM 1 TO iterations DO
    FOR each constraint c IN constraints DO project_constraint(c) END
  END
  FOR each particle p DO
    p.velocity ← (p.position_predicted - p.position) / dt
    p.position ← p.position_predicted
  END
END
```

**Distance constraint projection:**

```
FUNCTION project_distance_constraint(A, B, rest_length)
  delta ← B.position_predicted - A.position_predicted; dist ← magnitude(delta)
  direction ← delta / dist; error ← dist - rest_length
  w_total ← A.inv_mass + B.inv_mass
  correction ← direction * (error / w_total)
  A.position_predicted ← A.position_predicted + correction * A.inv_mass
  B.position_predicted ← B.position_predicted - correction * B.inv_mass
END
```

---

## Fluid Simulation — SPH

Particles contribute to density/pressure fields via kernel function.

### SPH Kernel

$$W(r, h) = \frac{315}{64\pi h^9}(h^2 - r^2)^3, \quad r \leq h$$

### Density & Pressure

```
FUNCTION compute_density(particle_i, neighbours)
  density ← 0
  FOR each neighbour j IN neighbours DO
    r ← magnitude(particle_i.position - j.position)
    density ← density + j.mass * kernel(r, SMOOTHING_RADIUS)
  END
  RETURN density
END

FUNCTION compute_pressure(density, rest_density, pressure_constant) → float
  RETURN pressure_constant * (density - rest_density)
END
```

---

## Calculus Translated to Code

| Concept             | Mathematical Form                                     | Code Translation                                  |
| ------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| Velocity            | $v = dx/dt$                                           | `pos += vel * dt`                                 |
| Acceleration        | $a = dv/dt$                                           | `vel += acc * dt`                                 |
| Work-energy theorem | $W = \int F \cdot dx$                                 | Accumulate `dot(F, dpos)` each step               |
| Damped oscillation  | $\ddot{x} + 2\zeta\omega_n\dot{x} + \omega_n^2 x = 0$ | Spring-damper system                              |
| Wave equation       | $\partial^2 u / \partial t^2 = c^2 \nabla^2 u$        | Height-field water simulation                     |
| Gradient            | $\nabla f$                                            | Direction of steepest ascent in scalar field      |
| Divergence          | $\nabla \cdot \vec{v}$                                | Fluid source/sink; ≈0 for incompressible          |
| Curl                | $\nabla \times \vec{v}$                               | Rotation in vector field; drives vorticity        |

---

## Fixed vs. Variable Timestep

Decouple rendering frame rate from physics tick rate:

```
FUNCTION game_loop(physics_world)
  physics_accumulator ← 0; FIXED_DT ← 1/120
  LOOP:
    frame_time ← get_delta_time()
    physics_accumulator ← physics_accumulator + frame_time
    WHILE physics_accumulator >= FIXED_DT DO
      physics_world.step(FIXED_DT)
      physics_accumulator ← physics_accumulator - FIXED_DT
    END
    alpha ← physics_accumulator / FIXED_DT
    render(physics_world, interpolate = alpha)
  END
END
```

---

## Choosing an Integration Scheme

| Scenario                                | Recommended Method                  |
| --------------------------------------- | ----------------------------------- |
| Simple game objects (platformer, balls) | Semi-implicit Euler                 |
| Cloth / rope with many constraints      | Verlet + PBD                        |
| Stiff springs without PBD               | RK4 or implicit Euler               |
| Orbital mechanics, ballistics           | RK4                                 |
| SPH fluids                              | Semi-implicit Euler (small dt)      |
| Real-time soft bodies for games         | PBD — fast, stable, artist-tunable  |

---

## Integration of Math Skills

| Need                                          | Use                                    |
| --------------------------------------------- | -------------------------------------- |
| Normalise vectors, distances, cross products  | **geometry** skill                     |
| Angles, rotations, angular velocity, sin/cos  | **trigonometry** skill                 |
| Rotation matrices, quaternions, transforms    | **linear-algebra** skill               |
| Spatial queries (ray vs. shape for collision) | **geometry** skill                     |
| Dot products for relative velocity projection | **geometry** or **trigonometry** skill |

---

## Examples

**Input:** "Write a function to apply a spring force between two particles."

**Physical Model:** Hooke's Law ($F = -k\Delta x$) + viscous damping ($F_d = -c\vec{v}_{rel}$).

**Integration Strategy:** Semi-Implicit Euler or Verlet.

**Implementation:**
```js
function computeSpringForce(pA, pB, restLength, stiffness, damping) {
  const delta = sub(pB.pos, pA.pos);
  const dist = magnitude(delta);
  if (dist < 1e-8) return ZERO_VECTOR;
  const dir = scale(delta, 1 / dist);
  const extension = dist - restLength;
  const springForce = stiffness * extension;
  const relVel = sub(pB.vel, pA.vel);
  const dampForce = damping * dot(relVel, dir);
  return scale(dir, springForce + dampForce);
}
```

---

## Common Mistakes

| Mistake                                 | Why it Happens                                   | Fix                                                      |
| --------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| Simulation explodes                     | Forward Euler + stiff springs                    | Switch to semi-implicit Euler; reduce dt                 |
| Objects sink through floors             | No positional correction after impulse           | Add penetration correction                               |
| Cloth stretches infinitely              | Constraint iterations too few in PBD             | Increase solver iterations (8–16)                        |
| SPH clump/scatter                       | Pressure constant/rest density wrong             | Tune constants together                                  |
| Framerate affects physics               | Physics tied to render loop                      | Fixed timestep accumulator                               |
| Angular velocity error                  | Euler-integrating quaternion directly            | Use axis-angle or `q * (1 + 0.5 * omega * dt)`           |

---

## Resources

- [Gaffer on Games (Fixed Timestep)](https://gafferongames.com/post/fix_your_timestep/)
- [SPH Fluids — Müller et al.](https://matthias-research.github.io/pages/publications/sca03.pdf)
- [PBD — Müller et al.](https://matthias-research.github.io/pages/publications/posBasedDyn.pdf)

## Related Skills

- **[geometry](../geometry/SKILL.md)** — Collision detection, spatial tests.
- **[trigonometry](../trigonometry/SKILL.md)** — Angular velocity, oscillation.
- **[linear-algebra](../linear-algebra/SKILL.md)** — Matrix/vector math for rigid/soft bodies.
- **[game-math](../game-math/SKILL.md)** — Integration with game engines.
