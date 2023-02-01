// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
// eslint-disable-next-line unicorn/prevent-abbreviations
const config = {
    packageManager: 'npm',
    reporters: [ 'html', 'clear-text', 'progress' ],
    testRunner: 'jest',
    testRunner_comment:
        'Take a look at (missing \'homepage\' URL in package.json) for information about the jest plugin.',
    coverageAnalysis: 'perTest',
    disableTypeChecks: '{src,tests}/**/*.{js,ts,jsx,tsx,html,vue}',
    ignoreStatic: true,
    ignorePatterns: [
        '.husky',
        '.out',
        '.coverage',
        'documentation',
        'migrations',
        'reports',
        'temp',
    ],
}
export default config
