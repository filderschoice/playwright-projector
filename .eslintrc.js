module.exports = {
  root: true,
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    requireConfigFile: false,
    sourceType: "module",
    ecmaVersion: 12,
  },
  plugins: [],
  extends: ["eslint:recommended", "prettier"],
  rules: {
    "no-case-declarations": "off",
    "no-multiple-empty-lines": [2, { max: 2 }],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-redeclare": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
};
