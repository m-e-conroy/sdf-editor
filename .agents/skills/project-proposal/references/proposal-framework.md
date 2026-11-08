# Project Proposal Framework & Discovery Guidelines

This reference provides strategic discovery methodologies, technical assessment frameworks, and milestone breakdown standards for synthesizing project proposals.

---

## 1. Discovery Dimensions

When guiding discovery sessions, examine four core dimensions:

### A. Problem & Value Proposition
- **Core Problem**: What exact friction, limitation, or gap is being addressed?
- **Target Audience / Personas**: Who are the primary end users and what are their pain points?
- **Value Metrics**: How will success be evaluated quantitatively (KPIs, response times, adoption) and qualitatively (satisfaction, ease of use)?

### B. Technical Constraints & Landscape
- **Runtime & Deployment**: Serverless, containers, edge, desktop, or mobile?
- **Data Persistence**: Relational (PostgreSQL/MySQL), Document (MongoDB), Key-Value/Cache (Redis), or Vector store?
- **Integration Touchpoints**: External third-party APIs, authentication providers, message queues, webhook consumers.
- **Security & Compliance**: Sensitive user data, RBAC needs, OWASP top 10 compliance standards.

### C. Aesthetic & User Experience Vision
- **Design Archetype**: Clean minimal, data-dense technical, playful/expressive, or luxury/editorial.
- **Typography & Color Hierarchy**: Primary branding fonts, accessible contrast ratios, theme modes (dark/light).
- **Interaction Patterns**: Micro-interactions, animated state transitions, accessible keyboard navigation.

### D. Scope Boundaries
- **MVP (Must-Have)**: Minimum set of functional capabilities required to test the core value hypothesis.
- **Post-MVP (Nice-to-Have)**: Enhancements, secondary integrations, optimization passes deferred to subsequent iterations.
- **Explicit Exclusions**: Out-of-scope elements explicitly documented to prevent scope creep.

---

## 2. Milestone Phasing Standard

Decompose multi-week projects into 3 to 4 sequential, testable milestones:

```
[Phase 1: Foundation & Core Architecture]
       │
       ▼
[Phase 2: Core UX, Flows & Integration]
       │
       ▼
[Phase 3: Hardening, Polish & Delivery]
```

### Phase 1: Foundation & Core Architecture (P1)
- Data model design, schema migrations, and ORM setup.
- Core server endpoints, domain contracts, or headless computational logic.
- Automated testing harness and baseline smoke tests.

### Phase 2: Core UX & Integration (P2)
- Key interface views and responsive UI components.
- State management and client-server synchronization.
- Primary end-to-end user workflows (e.g., onboarding, checkout, search, dashboard).

### Phase 3: Hardening, Polish & Delivery (P3)
- Performance profiling, bundle size optimization, and caching.
- Security audit, input sanitization, and error boundary handling.
- Documentation, deployment runbooks, and production configuration.

---

## 3. Proposal Markdown Template

When writing formal proposals to `docs/PROPOSALS/{project-name}-proposal.md`, adhere to this structure:

```markdown
# Project Proposal: {Project Name}

**Status:** Draft / Approved  
**Author:** {Lead Planner / Architect}  
**Date:** {YYYY-MM-DD}

## Executive Summary
{A concise 2-3 paragraph summary of the project goals, audience, and expected impact.}

## Technical Architecture
- **Frontend / Client:** {Framework, UI Library, State Strategy}
- **Backend / Services:** {API style, Runtime, Compute Layer}
- **Data Layer:** {Database engine, Caching, Migrations}
- **Key Dependencies:** {Critical libraries or services}

## Milestone Roadmap
| Phase | Milestone Name | Key Deliverables | Estimated Target |
|:-----:|:--------------|:-----------------|:-----------------|
| P1    | Architecture   | Data schemas, auth, core logic | Week 1-2 |
| P2    | Experience     | UI views, interactive flows | Week 3-4 |
| P3    | Production     | Hardening, security, release | Week 5 |

## Risk Matrix
| Identified Risk | Severity | Mitigation Strategy |
|:----------------|:--------:|:--------------------|
| Scope expansion | High     | Strict MVP boundary enforcement |
| Third-party API rate limits | Medium | Aggressive client/server caching |

## Acceptance Criteria
- [ ] Core end-to-end journey passes verification.
- [ ] Test coverage threshold met (>80%).
- [ ] Visual polish aligns with design tokens.
```

