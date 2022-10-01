module.exports = {
    '*.{(c|m)?js,ts}': filenames => [
        'npm run lintfix',
        `jest --findRelatedTests ${filenames.join(' ')} --passWithNoTests`,
    ],
}
