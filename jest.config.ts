import type { JestConfigWithTsJest } from 'ts-jest'

const jestSetup: JestConfigWithTsJest = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@mikro-orm/*$': '<rootDir>/node_modules/@mikro-orm/$1',
    },
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
    ],
    setupFiles: ['<rootDir>/jest.setup.ts'],
}

export default jestSetup
