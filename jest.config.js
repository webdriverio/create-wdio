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
            functions: 55,
            lines: 37,
            statements: 38
        }
    },
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        'node_modules/'
    ]
}
