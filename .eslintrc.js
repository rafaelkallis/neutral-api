module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jest',
    'promise',
  ],
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:promise/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    jest: true,
    node: true,
    es6: true,
  },
  rules: {
    'curly': ['error'],
    'complexity': ['error', 10],
    'no-console': ['warn'],
    'prefer-object-spread': ['error'],
    'consistent-return': ['error'],
    'no-invalid-this': ['error'],
    'no-dupe-class-members': 'off',
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/promise-function-async': ['error'],
    '@typescript-eslint/prefer-readonly': ['error'],
    'jest/expect-expect': ['error', { 'assertFunctionNames': ['expect', 'td.verify']}],
  },
};
