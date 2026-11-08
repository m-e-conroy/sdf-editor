---
name: project-proposal
description: Comprehensive project discovery, strategic planning, and proposal generation. Trigger: "project proposal", "help me plan", "create a proposal", "plan project".
version: 1.0.0
---

# Project Proposal & Planning

Transform vague ideas into concrete project roadmaps through discovery and planning.

## When to Use

Trigger when:
- New project idea proposed without a clear roadmap.
- User says "I want to build...", "Help me plan...", "Create a project proposal", "Plan a project".
- Major new phase of existing project initiated.
- Strategic alignment needed across agent fleet.

## Instructions

1. **Strategic Discovery** (`planner`): Conduct Socratic Q&A via **[brainstorming](../brainstorming/SKILL.md)**. Focus:
   - **Core Objective**: Identify primary problem solved.
   - **Target Audience**: Determine target audience.
   - **Success Metrics**: Define measurable success criteria.
   - **Constraints**: Identify budget, tech stack preferences, deadlines.
2. **Technical Feasibility** (`software-architect`): Analyze requirements. Recommend architecture (Monolith vs. Microservices, DB choice). Identify technical risks.
3. **Visual Identity Vision** (`creative-director`): Establish aesthetic direction (mood, palette, UI/UX metaphors).
4. **Milestone Mapping** (`planner`): Break project into 3-5 major milestones:
   - **Milestone 1**: MVP / Core Logic.
   - **Milestone 2**: UI & Interaction.
   - **Milestone 3**: Polish & Scale.
5. **Resource Allocation** (`project-manager`): Map milestones to agent roles, estimate effort.
6. **Proposal Generation** (`documentation-writer`): Consolidate inputs into formal proposal. Save to `docs/PROPOSALS/{project-name}-proposal.md`.
7. **User Review**: Present summary for approval before proceeding to implementation.

## Output Format

### Project Proposal Summary: {Project Name}

**1. Vision & Scope**
- **Objective**: {One-sentence goal}
- **In-Scope**: {Key features}
- **Out-of-Scope**: {Clarify boundaries}

**2. Technical & Visual Strategy**
- **Architecture**: {Stack/Patterns}
- **Aesthetic**: {Mood/Design Style}

**3. Roadmap (Milestones)**
| Phase | Goal | Deliverables |
| :--- | :--- | :--- |
| **P1** | Foundation | {e.g., Auth, DB Schema} |
| **P2** | Core UI | {e.g., Dashboard, Logic} |
| **P3** | Launch | {e.g., Polish, SEO, Deployment} |

**4. Next Steps**
- [ ] Approve proposal.
- [ ] Trigger implementation or scaffolding.

## Examples

**Input:** "I want to build a decentralized library for researchers."
**Expected Action:**
1. Run discovery Q&A about blockchain vs. centralized DB via `brainstorming`.
2. Analyze architecture options (e.g. IPFS + Next.js).
3. Establish design aesthetic (e.g. minimalist scholar).
4. Formulate 4-milestone roadmap.
5. Save formal proposal document and present summary.

## Resources

- [Proposal Framework](references/proposal-framework.md) — Comprehensive discovery guidelines, milestone structuring, and proposal criteria.
- [Brainstorming Skill](../brainstorming/SKILL.md) — Socratic discovery and question framework.
- [Plan Writing Skill](../plan-writing/SKILL.md) — Detailed task breakdowns.

## Related Skills

- **[ui-ux-pro-max](../ui-ux-pro-max/SKILL.md)** — Design strategy and intelligence.
- **[brainstorming](../brainstorming/SKILL.md)** — Core discovery tool.
- **[plan-writing](../plan-writing/SKILL.md)** — Detailed task breakdown.
- **[art-theory](../art-theory/SKILL.md)** — Design direction.
- **[project-organization](../project-organization/SKILL.md)** — Structural standards.
