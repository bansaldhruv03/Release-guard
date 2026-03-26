# Release Guard Organization Onboarding Guide

Welcome to Release Guard! This tool enforces environment consistency and secure git workflows across your organization.

## 1. Developer Setup
Each developer must configure the CLI agent (`rg-agent`) on their local machines.

### Installation
```bash
# Clone the internal repo and link (or install from private npm)
cd rg-agent
npm install
npm link
```

### Authentication
Login to your organization's Release Guard instance:
```bash
rg-agent login
# Default POC URL: http://localhost:3000/graphql
# Default POC Admin: admin / password
```

### CLI Integration
Inside your repository, run: 
```bash
rg-agent setup
```
This installs the `.githooks` and ensures your current project follows the promotion policies.

## 2. Policy Definitions
The default promotion path is:
- **DEV** (`feature/*`) -> **QA** (`develop`) -> **STAGE** (`qa`) -> **PROD** (`main`)

These policies are enforced:
1. **Locally**: During `git push` via the `rg-agent` hook.
2. **In CI/CD**: Within the `cloudbuild.yaml` pipeline before any deployment release is created.

## 3. Operations & Dashboard
Monitor release safety and environment health at:
`http://localhost:3000` (or your deployed Cloud Run URL).

## 4. Production Hardening
Ensure the following secrets are set in Google Secret Manager:
- `GITLAB_TOKEN`: GitLab Personal Access Token.
- `JWT_SECRET`: Secret key for authentication.
- `RELEASE_GUARD_TOKEN`: A valid JWT token for CI/CD pipeline authentication.
