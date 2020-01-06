module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:security/recommended',
    'plugin:promise/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'jest',
    'security',
    'promise',
  ],
  parser: '@typescript-eslint/parser',
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
  },
};
