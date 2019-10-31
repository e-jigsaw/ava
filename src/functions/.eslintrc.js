const {resolve} = require('path')

module.exports = {
  extends: [
    "../../.eslintrc.js"
  ],
  parserOptions: {
    project: resolve(__dirname, "./tsconfig.json"),
    tsconfigRootDir: "."
  }
}
