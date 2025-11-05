# GitHub Actions CI Pipeline

## Overview

This directory contains GitHub Actions workflows for continuous integration.

## CI Workflow (ci.yml)

The CI workflow runs on every push and pull request to ensure code quality and build success.

### Steps:
1. **Checkout** - Checks out the repository code
2. **Setup Node.js** - Installs Node.js 20.x with npm caching
3. **Install dependencies** - Runs `npm ci` for clean install
4. **Lint** - Runs ESLint to check code style and quality
5. **Type check** - Runs TypeScript type checking
6. **Test** - Runs the test suite in CI mode
7. **Build** - Creates production build with Vite
8. **Upload artifacts** - Saves build output for 7 days

### Required package.json Scripts

The following npm scripts must be defined in `package.json` for the CI workflow to function:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ci": "vitest run"
  }
}
```

### Technology Stack Assumptions

- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linter**: ESLint
- **Testing**: Vitest (or any framework with a `test:ci` script)

### Customization

To modify the CI behavior:
- Change Node.js version in the `matrix.node-version` array
- Add or remove steps as needed
- Adjust the `continue-on-error` flag for non-blocking checks
- Modify artifact retention period (default: 7 days)
