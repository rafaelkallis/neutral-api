module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:security/recommended',
    'plugin:promise/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  plugins: [
    '@typescript-eslint',
    'jest',
    'security',
    'promise',
    'import',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'curly': ['error'],
    'complexity': ['error', 10],
    'no-console': ['warn'],
    'prefer-object-spread': ['error'],
    'consistent-return': ['error'],
    'no-invalid-this': ['error'],
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
