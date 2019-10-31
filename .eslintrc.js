module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint",
    "plugin:react/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "prettier"
  ],
  rules: {
    "prettier/prettier": [
      2, {
        "singleQuote": true,
        "semi": false
      }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/camelcase": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  },
  env: {
    node: true,
    es6: true,
    browser: true
  },
  settings: {
    react: {
      version: "detect"
    }
  }
}
