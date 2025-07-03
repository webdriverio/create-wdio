import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
        env: {
            WDIO_UNIT_TESTS: '1'
        },
        /**
         * not to ESM ported packages
         */
        exclude: ['build', '.idea', '.git', '.cache', '**/node_modules/**', '__mocks__'],
        coverage: {
            enabled: true,
            include: ['src/**/*.ts'],
            exclude: ['src/types.ts'],
            thresholds: {
                lines: 90,
                functions: 80,
                branches: 70,
                statements: 90,
            },
        },
    },
})
