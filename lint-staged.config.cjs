module.exports = {
    '*.{(c|m)?js,(c|m)?ts}': () => [
        'npm run lintfix',
    ],
    '*.(c|m)?ts': () => [
        'npm run typecheck',
    ],
}
