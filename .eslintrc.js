module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'comma-dangle': 0,
    'no-plusplus': 'off',
    'no-undef': 'off',
    'semi': 0,
    'no-param-reassign': ['error', { 'props': false }],
    'space-before-function-paren': 0,
    'one-var': ['error', 'never' ],
    'import/first': 0,
    'import/no-webpack-loader-syntax': 'off',
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }]
  }
}
