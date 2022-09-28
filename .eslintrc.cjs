module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
        'eslint:recommended',
        'plugin:security/recommended',
        'plugin:sonarjs/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:promise/recommended',
        'plugin:unicorn/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'security',
        'promise',
        'unicorn',
    ],
    rules: {
        'array-bracket-spacing': [ 'error', 'always', { singleValue: false, objectsInArrays: false }],
        'arrow-parens': [ 'error', 'as-needed', { requireForBlockBody: true }],
        indent: [ 'error', 4 ],
        'no-use-before-define': ['error'],
        'no-unused-vars': ['error'],
        'no-shadow': ['error'],
        'linebreak-style': [ 'error', 'unix' ],
        'max-len': [ 'error', 120 ],
        'object-curly-newline': [
            'error',
            {
                ObjectExpression: { consistent: true },
                ObjectPattern: { consistent: true },
                ImportDeclaration: { consistent: true },
                ExportDeclaration: { multiline: true, minProperties: 3 },
            },
        ],
        'no-console': 0,
        semi: [ 'error', 'never' ],
        'import/extensions': 1,
        'import/no-unresolved': [ 2, { ignore: ['^(.)?./'] }],
        'import/prefer-default-export': 0,
    },
    overrides: [
        {
            files: ['src/entities/**/*.*'],
            rules: {
                indent: 'warn',
                'unicorn/filename-case': 0,
            },
        },
        {
            files: ['src/migrations/*.*'],
            rules: {
                'unicorn/filename-case': 0,
                'max-len': 0,
            },
        },
        {
            files: ['src/seeders/*.*'],
            rules: {
                'unicorn/filename-case': 0,
                'class-methods-use-this': 0,
            },
        },
    ],
}
