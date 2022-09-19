const path = require('path')

module.exports = {
    '*.{js,ts}': filenames => [
        'npm run lintfix',
    ],
}
