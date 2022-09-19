const path = require('path')

module.exports = {
    '*.{(c|m)?js,ts}': filenames => [
        'npm run lintfix',
    ],
}
