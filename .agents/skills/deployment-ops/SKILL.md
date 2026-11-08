---
name: deployment-ops
description: Deployment, CI/CD, and DevOps patterns. Docker, GitHub Actions, environment management, monitoring, and staging. Triggers: "docker", "ci/cd", "github actions", "deployment", "staging", "production", "monitoring", "sentry", "prometheus", "terraform".
version: 1.0.0
---

# Deployment & Ops

Purpose: automate, monitor, and scale software deployments with high reliability.

## When to Use

Trigger:
- Containerize applications (Docker).
- Automate build/test/deploy pipelines (CI/CD).
- Manage environment variables and secrets across stages.
- Implement observability (Logs, Metrics, Traces).
- Scale infrastructure via Code (IaC).
- Setup staging and production environments.

## Instructions

Apply DevOps best practices:

### 1. Containerization (Docker)
- **Multi-Stage Builds**: Separate build environment from runtime to keep images small and secure.
- **Base Images**: Use `alpine` or `slim` versions.
- **Security**: Run as non-root user. Use `.dockerignore` to exclude secrets and `node_modules`.

### 2. CI/CD (GitHub Actions)
- **Pipeline Structure**: `Lint` → `Test` → `Build` → `Deploy`.
- **Caching**: Cache dependencies (`npm`, `pip`) to speed up runs.
- **Environments**: Use GitHub Environments for protected variables and manual approvals for Production.

### 3. Environment Management
- **Statelessness**: Apps must get configuration from environment variables, not local files.
- **Secret Management**: Never commit `.env` files. Use platform secrets (GitHub Secrets, AWS Secrets Manager).

### 4. Monitoring & Observability
- **Error Tracking**: Integrate Sentry or GlitchTip for real-time exception monitoring.
- **Metrics**: Use Prometheus/Grafana or Datadog for infra/app health.
- **Logging**: Structured JSON logs. Centralize using ELK, Loki, or Logtail.

### 5. Infrastructure as Code (IaC)
- **Terraform / Pulumi**: Define cloud resources (DBs, Buckets, Compute) as code.
- **Version Control**: Manage infra changes via PRs, same as application code.

## Output Format

Summary:
```markdown
### Deployment Specification: {Project}

**1. Containerization**
- (Base image, multi-stage logic, healthcheck)

**2. CI/CD Pipeline**
- (Triggers, jobs, caching strategy)

**3. Environment Matrix**
- (Local, Staging, Production variables)

**4. Monitoring & Alerting**
- (Tools: Sentry, Datadog, Uptime checks)

**5. Scaling Policy**
- (Horizontal/Vertical, Auto-scaling triggers)
```

## Related Skills

- **[performance-profiling](../performance-profiling/SKILL.md)** — System health monitoring.
- **[git-management](../git-management/SKILL.md)** — Branching strategies for deployment.
- **[edge-serverless](../edge-serverless/SKILL.md)** — Serverless deployments.
- **[docker-containerization](../docker-containerization/SKILL.md)** — Containerization patterns.
