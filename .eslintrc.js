module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'import', 'jsx-a11y'],
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 0,
    'react/prop-types': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
    'react/display-name': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'jsx-a11y/anchor-is-valid': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/ban-types': 0,
    'import/no-unresolved': 'off',
    'no-empty-pattern': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'jsx-a11y/heading-has-content': 0,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
