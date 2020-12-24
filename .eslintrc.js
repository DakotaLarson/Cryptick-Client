module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    env: {
        "node": true,
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/ban-ts-ignore": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "semi": 2,
    }
};