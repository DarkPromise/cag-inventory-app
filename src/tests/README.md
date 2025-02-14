# Backend Testing Documentation

## Overview

This project uses Jest as the primary testing framework for backend testing. All tests are focused on backend actions, other categories and are organized in a simple, clear structure.

## Testing Structure

```plaintext
src/
└── tests/
    ├── actions/
    |   ├── *.test.ts
    |   └── ...
    ├── dynamodb/
    |   └── ...
    └── <other test categories>
```

All tests are located in the `src/tests/actions` directory, with each test file corresponding to specific backend actions.

## Test Categories

### Server Action Tests

- Located in `src/tests/actions/`
- Test backend actions and their associated logic
- Tests are organized by feature or functionality
- Each action should have its own test file
- Tests can include both unit tests for isolated functions and integration tests for complete workflows
- A coverage report is generated for each test run

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- users.test.js
```

### Test Environment

Most tests require a DynamoDB instance to be running locally. You can use the `docker-compose.yml` file to start a local DynamoDB instance:

```bash
cd dynamodb
docker-compose up -d --wait
```
