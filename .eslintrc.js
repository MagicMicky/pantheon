module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'unused-imports'
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Unused imports and variables
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { 
        vars: 'all', 
        varsIgnorePattern: '^_', 
        args: 'after-used', 
        argsIgnorePattern: '^_' 
      }
    ],
    
    // Code quality
    '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // React specific
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript
    
    // Potential bugs
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    
    // Code style
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Allow certain patterns common in your codebase
    '@typescript-eslint/ban-ts-comment': 'warn',
    'react/display-name': 'off',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  ignorePatterns: [
    'build/',
    'node_modules/',
    '*.js' // Ignore JavaScript files in root (like this config)
  ]
}; 