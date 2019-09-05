module.exports = {
  env: {
    es6: true
  },
  extends: ["eslint:recommended", "airbnb", "prettier"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    "spaced-comment": 1,
    "no-unused-vars": 1,
    "lines-between-class-members": 1,
    "import/first": 1,
    "spaced-comment": 0,
    "prefer-template": 1,
    "react/jsx-filename-extension": 0
  },
  parser: "babel-eslint"
};
