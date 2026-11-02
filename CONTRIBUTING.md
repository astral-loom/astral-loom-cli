# Contributing to Astral Loom Kit

We highly welcome contributions to Astral Loom Kit! Please follow these guidelines to help us maintain a high-quality codebase.

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/astral-loom/astral-loom-cli.git
   cd astral-loom-cli
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run tests:**
   ```bash
   npm run test:coverage   # what CI runs, including the coverage gate
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

## Coding Conventions

- **TypeScript:** Write all new code in TypeScript.
- **Formatting:** We use Prettier for code formatting. Run `npm run format` to automatically format your code.
- **Linting:** We use ESLint. Ensure your code passes the linter by running `npm run lint`.
- **Small functions:** Keep functions small, focused, and well-typed.

## Test Coverage

CI runs the suite as `vitest run --coverage` and **fails the build** if coverage drops
below the thresholds configured in `vitest.config.ts`:

| Metric       | Minimum |
| ------------ | ------- |
| Statements   | 95%     |
| Branches     | 90%     |
| Functions    | 95%     |
| Lines        | 95%     |

Run the same check locally before pushing:

```bash
npm run test:coverage   # prints the table and enforces the thresholds
npm test                # runs the suite without the coverage gate
```

Coverage is measured over every file in `src/` (test files and `src/**/__tests__/`
are excluded). On each CI run the `lcov` and HTML reports are uploaded as the
**`coverage-report`** artifact — download it from the run summary to see exactly which
lines a diff left untested.

These numbers are a **ratchet**: when you add code and tests, raise the thresholds to
match what the suite now achieves. Lowering one is a regression in test quality and
needs an explicit maintainer decision, so open an issue first rather than doing it in a
feature PR.

Note that `@vitest/coverage-v8` must stay version-locked to `vitest` itself — running
mismatched versions prints a warning and can silently mis-report coverage. Bump them
together.

## Pull Request Guidelines

1. **Create a branch** for your feature or bug fix: `git checkout -b feature/my-new-feature` or `git checkout -b fix/my-bug-fix`.
2. **Write tests** for any new utilities or logic.
3. **Ensure CI passes**, including tests, linting, and formatting checks.
4. **Submit a Pull Request** with a clear description of the changes and the problem they solve.

## Adding Wallet Adapters

If you want to add a new wallet adapter (e.g., Albedo, xBull), please implement the `WalletAdapter` interface found in `src/wallets/adapters.ts` and export it from `src/wallets/index.ts`.
