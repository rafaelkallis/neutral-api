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
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-use-before-define': ['error', { 'functions': false, 'classes': false }],
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

    '@typescript-eslint/ban-types': ['warn'],
    '@typescript-eslint/no-unsafe-assignment': ['warn'],
    '@typescript-eslint/no-unsafe-member-access': ['warn'],
    '@typescript-eslint/no-unsafe-return': ['warn'],
    '@typescript-eslint/no-unsafe-call': ['warn'],
    '@typescript-eslint/unbound-method': ['warn'],
    'jest/valid-title': ['warn'],
    '@typescript-eslint/no-empty-interface': ['warn'],
  },
};
