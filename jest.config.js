module.exports = {
    globals: {
        'ts-jest': {
            isolatedModules: true
        }
    },
    testMatch: [
        '**/tests/**/*.test.ts'
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/'
    ],
    collectCoverageFrom: [
        'src/**/*.ts'
    ],
    coverageDirectory: './coverage/',
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 21,
            functions: 66,
            lines: 39,
            statements: 40
        }
    },
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        'node_modules/'
    ]
}
