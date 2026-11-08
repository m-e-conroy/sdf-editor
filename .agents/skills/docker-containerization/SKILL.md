---
name: docker-containerization
description: Containerizing applications, multi-stage builds, and local orchestration via Docker Compose. Triggers: "docker", "containerize", "dockerfile", "docker-compose", "image optimization".
version: 1.0.0
---

# Docker Containerization Skill

## When to Use

- Ensure consistent dev/prod environments.
- Orchestrate multi-service local environments (App, DB, Redis).
- Optimize prod image size and security.

## Instructions

### 1. Multi-Stage Builds
- Use separate `build` and `runner` stages.
- Keep only prod dependencies in final image.
- Exclude source code, dev tools from `runner` stage.

### 2. Node.js Specifics
- Exclude `node_modules` via `.dockerignore`.
- Run as non-root user (`USER node`).
- Use `node:18-alpine` or slim images.

### 3. Docker Compose
- Use for local orchestration.
- Define environment variables in `.env`.
- Use volumes for dev hot-reloading.

## Output Format

Propose Docker Strategy:

```markdown
### Containerization: {Project}

**1. Base Image**
- (e.g. node:20-alpine)

**2. Build Strategy**
- (Multi-stage description)

**3. Composition**
- (Services in docker-compose.yml)

**4. Security Hardening**
- (User permissions, read-only FS, etc.)
```

## Related Skills

- **[deployment-ops](../deployment-ops/SKILL.md)**: CI/CD integration.
- **[nodejs-best-practices](../nodejs-best-practices/SKILL.md)**: Process management.
