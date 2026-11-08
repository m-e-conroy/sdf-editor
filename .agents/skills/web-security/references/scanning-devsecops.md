# Scanning & DevSecOps

Shift security left — scan across the whole SDLC, not just before release.

---

## 1. Threat Modeling (Design phase)

Before writing code, map the attack surface and define security requirements.

- Enumerate entry points, trust boundaries, data flows, assets.
- Ask per component: *what can go wrong here?* (STRIDE: Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation).
- Guides: **OWASP ASVS** (requirements baseline), **OWASP Threat Dragon** (diagramming).

---

## 2. Automated Security Testing (Implementation phase)

**SAST — Static Application Security Testing**
- Analyzes source code without running it.
- Catches: SQL concatenation, hardcoded secrets, unsafe sinks, weak crypto.
- Integrate into CI/CD; fail the build on high-severity findings.
- Tools: Semgrep, CodeQL, SonarQube, Snyk Code.

**DAST — Dynamic Application Security Testing**
- Attacks a running app in staging; injects payloads into forms/APIs.
- Catches runtime/config issues SAST can't see (auth flaws, misconfig, reflected XSS).
- Tools: OWASP ZAP, Burp Suite.

---

## 3. Dependency & Supply-Chain Auditing

- Run on **every build**: `npm audit`, `OWASP Dependency-Check`, Snyk.
- Flag packages with known **CVEs**; block/patch before merge.
- Maintain an **SBOM** (OWASP Dependency-Track) — inventory of all components + versions.

---

## 4. Logging & Monitoring (Production phase)

- Centralized **security logging** for anomalies: rapid failed logins, unusual payloads, access-control failures, spikes in 4xx/5xx.
- Store logs securely (tamper-evident, access-controlled); **never log secrets/PII in cleartext**.
- Real-time **alerts** on suspicious patterns.

---

## 5. Penetration Testing

- Engage professionals (or automated pentest tooling) to attack from the outside.
- Uncovers **chained** exploits automated SAST/DAST miss (e.g., IDOR + weak session → full takeover).
- Schedule before major releases and periodically.

---

## Pipeline placement (summary)

| Phase | Activity | Gate |
|-------|----------|------|
| Design | Threat modeling (ASVS, Threat Dragon) | Requirements defined |
| Commit / PR | SAST + secret scan | Block on high severity |
| Build | Dependency audit + SBOM | Block on known CVE |
| Staging | DAST | Review before prod |
| Production | Security logging + alerting | Continuous |
| Periodic | Penetration testing | Findings triaged |
