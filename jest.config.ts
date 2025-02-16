/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: "./src/tests/jest.setup.ts",

  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: "./src/tests/jest.teardown.ts",

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // A map from regular expressions to paths to transformers
  transform: { "^.+\\.(ts|tsx|js|jsx)?$": "ts-jest" },

  // Test folder location
  testMatch: ["<rootDir>/src/tests/**/*.test.ts"],
};

export default createJestConfig(config);
