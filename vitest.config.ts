import { defineConfig } from 'vitest/config';

// Coverage floor enforced by CI. Measured headroom as of this change:
//   statements/lines/functions 100%, branches 94.6%.
// Treat these as a ratchet: raise them as the suite grows. Lowering one is a
// regression in test quality and needs an explicit maintainer decision.
const coverageThresholds = {
  statements: 95,
  branches: 90,
  functions: 95,
  lines: 95,
};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // `text` keeps the numbers in the CI log; `lcov`/`html` are the artefacts
      // reviewers download to see which lines a diff left untested.
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/__tests__/**'],
      thresholds: coverageThresholds,
    },
  },
});
