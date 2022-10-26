module.exports = {
    '*.{(c|m)?js,(c|m)?ts}': filenames => [
        'npm run lintfix',
        `jest --findRelatedTests ${filenames.join(' ')} --passWithNoTests`,
    ],
    '*.(c|m)?ts': () => [
        'npm run typecheck',
    ],
}
