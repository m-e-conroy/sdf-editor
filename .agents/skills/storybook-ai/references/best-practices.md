# Storybook AI Best Practices

## 📝 Story Writing
- **Atomic Stories**: Each story should demonstrate exactly one concept or use case.
- **Explain the "Why"**: Use JSDoc to explain why a pattern exists, not just what it does.
- **Avoid Noise**: Remove `manifest` tag (`tags: ['!manifest']`) from stories that are irrelevant for AI (e.g., internal-only demos).

## 📖 Component Documentation
- **JSDoc Summaries**: Use `@summary` for high-level purpose. AI uses this for quick context.
- **Prop Descriptions**: Document every prop. Agents rely on these to avoid hallucinations.
- **Explicit MDX**: Avoid loops/dynamic generation in MDX for items AI needs to see (e.g., color tokens). Manifests are generated via static analysis.

## ⚙️ Technical Configuration
- **Prop Extraction**: Use `react-docgen-typescript` (default in many frameworks) for accurate type data.
- **Evaluation**: Manifests evaluate final rendered stories (args/decorators applied).
- **Manifest Tagging**: 
  - `!manifest` at component level: Exclude entire component.
  - `!manifest` at story level: Exclude specific story.
  - `!manifest` at MDX level: Exclude documentation page.

## 🤖 Agent Interaction
- **Trust Docs Over Patterns**: Agents should always query `get-documentation` rather than assuming properties based on naming (e.g., `primary`, `shadow`, `size`).
- **Verify with Tests**: Use `run-story-tests` to confirm AI-generated changes work as intended.
