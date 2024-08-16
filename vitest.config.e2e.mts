import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    include: ['**/*.e2e.spec.ts'],
    exclude: ['node_modules', 'data'],
    globals: true,
    root: './',
    // setupFiles: ['./e2e/setup.e2e.ts'],
    // globalSetup: ['./e2e/global-setup.e2e.ts'],
    testTimeout: 10000,
  },
})
