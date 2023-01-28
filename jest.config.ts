import type { JestConfigWithTsJest } from 'ts-jest'

const jestSetup: JestConfigWithTsJest = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@mikro-orm/*$': '<rootDir>/node_modules/@mikro-orm/$1',
    },
    moduleFileExtensions: [ 'js', 'ts' ],
    testMatch: ['<rootDir>/tests/**/?(*.)+(spec|test).[jt]s'],
    transform: {
        '^.+\\.m?[tj]sx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    collectCoverage: false,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{js,ts}',
        '!<rootDir>/src/{docs,entities,migrations,seeders}/**/*.*',
        '!<rootDir>/src/index.ts',
        '!<rootDir>/src/errors/**/*.ts',
        '<rootDir>/src/errors/ProblemDocument.{ts}',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    setupFiles: ['<rootDir>/jest.setup.ts'],
    restoreMocks: true,
}

export default jestSetup
