module.exports = {
  env: {
    browser: true, // Assuming some client-side JS might exist or be added later
    commonjs: true,
    es6: true, // Or a slightly older version if preferred, like es2020
    node: true,
    jquery: true, // Based on common usage with ejs and public/javascripts
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Use the latest ECMAScript version
  },
  rules: {
    'node/no-unpublished-require': 'off', // Turn off for now, can be too noisy initially
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // Warn about unused vars, ignore if prefixed with _
    'indent': ['warn', 2], // Warn for 2-space indentation
    'quotes': ['warn', 'single'], // Warn for single quotes
    'semi': ['warn', 'always'], // Warn for missing semicolons
    // Add any other project-specific rules here
  },
  globals: {
    // Define any global variables used in your project if not covered by env
    // e.g., 'myGlobal': 'readonly'
  }
};
