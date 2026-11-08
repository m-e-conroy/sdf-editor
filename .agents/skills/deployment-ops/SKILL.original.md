---
name: deployment-ops
description: Deployment, CI/CD, and DevOps patterns. Docker, GitHub Actions, environment management, monitoring, and staging. Triggers: "docker", "ci/cd", "github actions", "deployment", "staging", "production", "monitoring", "sentry", "prometheus", "terraform".
version: 1.0.0
---

# Deployment & Ops Skill

> **Purpose**: Automate, monitor, and scale software deployments with high reliability.

## When to Use

- Containerizing applications (Docker).
- Automating build/test/deploy pipelines (CI/CD).
- Managing environment variables and secrets across stages.
- Implementing observability (Logs, Metrics, Traces).
- Scaling infrastructure via Code (IaC).
- Setting up staging and production environments.

## Instructions

Apply DevOps best practices:

### 1. Containerization (Docker)
- **Multi-Stage Builds**: Separate build environment from runtime to keep images small and secure.
- **Base Images**: Use `alpine` or `slim` variants.
- **Security**: Run as non-root user. Use `.dockerignore` to exclude secrets and `node_modules`.

### 2. CI/CD (GitHub Actions)
- **Pipeline Structure**: `Lint -> Test -> Build -> Deploy`.
- **Caching**: Cache dependencies (`npm`, `pip`) to speed up runs.
- **Environments**: Use GitHub Environments for protected variables and manual approvals for Production.

### 3. Environment Management
- **Statelessness**: Apps should get config from environment variables, not local files.
- **Secret Management**: Never commit `.env`. Use platform secrets (GitHub Secrets, AWS Secrets Manager).

### 4. Monitoring & Observability
- **Error Tracking**: Integrate Sentry or GlitchTip for real-time exception monitoring.
- **Metrics**: Use Prometheus/Grafana or Datadog for infra and app health.
- **Logging**: Structured JSON logs. Centralize using ELK, Loki, or Logtail.

### 5. Infrastructure as Code (IaC)
- **Terraform / Pulumi**: Define cloud resources (DBs, Buckets, Compute) as code.
- **Version Control**: Manage infra changes via PRs, same as application code.

## Output Format

Propose Deployment Strategy:

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

- **[performance-sre](../agents/performance-sre.md)**: Infrastructure optimization.
- **[git-management](../skills/git-management/SKILL.md)**: Branching strategies for deployment.
- **[edge-serverless](../skills/edge-serverless/SKILL.md)**: Alternative serverless deployment.
