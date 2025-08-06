module.exports = {
  testMatch: ["**/__tests__/**/*.(test|spec).js", "**/?(*.)+(test|spec).js"],
  testEnvironment: "node",
  coverageDirectory: "dist/test-coverage",
  collectCoverage: true,
  collectCoverageFrom: ["**/*.js", "!**/node_modules/**", "!**/config/**"],
};
