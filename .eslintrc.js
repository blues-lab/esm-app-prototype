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
    "prefer-template": 0,
    "no-plusplus": 0,
    "no-underscore-dangle": 0,
    "react/destructuring-assignment": 0,
    "react/jsx-filename-extension": 0,
    "react/jsx-one-expression-per-line": 0,
    "react/prop-types": 1,
    "react/sort-comp": 0
  },
  parser: "babel-eslint"
};
