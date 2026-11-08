# Project Scaffolding Cheatsheet & Stack Reference

This reference outlines standardized CLI scaffolding commands, core boilerplate requirements, and configuration standards.

---

## 1. Non-Interactive CLI Scaffolding Commands

Always use non-interactive flags when scaffolding via CLI tools in an agent environment:

### Vite (SPA / Frontends)
```bash
# React + TypeScript
npx -y create-vite@latest <project-name> --template react-ts

# Vue + TypeScript
npx -y create-vite@latest <project-name> --template vue-ts

# Vanilla TypeScript
npx -y create-vite@latest <project-name> --template vanilla-ts
```

### Next.js (Fullstack React)
```bash
npx -y create-next-app@latest <project-name> \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

### Hono (Lightweight / Edge Backend)
```bash
npm create hono@latest <project-name> -- --template nodejs
```

---

## 2. Standard Repository Initialization Checklist

1. **Git Initialization**:
   ```bash
   git init
   git branch -M main
   ```
2. **Git Ignore Configuration**:
   Ensure `.gitignore` covers:
   - Node / Package managers: `node_modules/`, `.pnpm-store/`, `dist/`, `build/`, `.output/`
   - Environments & Secrets: `.env`, `.env.local`, `.env.*.local`, `*.pem`
   - Editor & OS: `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`
   - Logs: `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`

3. **Design Token Initialization**:
   - Establish CSS variables for colors, typography scales, border radii, and transitions in `src/index.css` or `src/globals.css`.
   - Never leave default Vite/React starter template CSS (delete placeholder SVGs and counter code immediately).

4. **Package Verification**:
   - Verify dependencies install cleanly.
   - Run type-check (`tsc --noEmit` or `npm run build`) before declaring initialization complete.

