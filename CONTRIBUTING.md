# Contributing to Astral Loom Kit

We welcome contributions to Astral Loom Kit! Please follow these guidelines to help us maintain a high-quality codebase.

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
   npm run test
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

## Pull Request Guidelines

1. **Create a branch** for your feature or bug fix: `git checkout -b feature/my-new-feature` or `git checkout -b fix/my-bug-fix`.
2. **Write tests** for any new utilities or logic.
3. **Ensure CI passes**, including tests, linting, and formatting checks.
4. **Submit a Pull Request** with a clear description of the changes and the problem they solve.

## Adding Wallet Adapters

If you want to add a new wallet adapter (e.g., Albedo, xBull), please implement the `WalletAdapter` interface found in `src/wallets/adapters.ts` and export it from `src/wallets/index.ts`.
