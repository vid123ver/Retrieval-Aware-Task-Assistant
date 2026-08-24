## Testing
PHase 1 - Assignment 4
Tests are written with Vitest and Supertest, covering the utils, service, and API layers.

### Running tests

From the `backend/` folder:

```bash
npm install
npm test
```

This runs the full suite (`vitest run`). The test suite does not require a real Gemini API key or external Gemini API access. External dependencies used by the tests are mocked.
### What's covered

- **`tests/unit/dateUtils.test.ts`** — unit tests for `normalizeDueDate`: today, tomorrow, each weekday, valid ISO dates, invalid ISO dates (e.g. `2026-02-31`), and garbage input.
- **`tests/unit/taskService.test.ts`** — unit tests for the task service (create, duplicate rejection, update, not-found, delete, toggle). The repository layer is mocked so tests never touch the real `tasks.json` file.
- **`tests/integration/taskApi.test.ts`** — integration tests that hit the real Express routes with Supertest and check status codes and response bodies.
- **`tests/integration/auth.test.ts`** — auth middleware tests: no token (401), wrong token (401), wrong scheme (401), correct token (200).
- **`tests/integration/geminiToolLoop.test.ts`** — mocks the Gemini client to return a scripted `create_task` function call, and asserts the tool-call loop executes it and sends the result back correctly.
- **`tests/regression/taskService.regression.test.ts`** — a regression test for a real bug from Assignment 3: duplicate task titles that only differed by casing or extra spaces (e.g. `"Buy Milk"` vs `"  buy   milk  "`) weren't being caught. This test locks in the fix.

### Mocking approach

- The task repository (`readTasks` / `writeTasks`) is mocked in service and API tests so tests are fast and don't depend on the file system.
- The Gemini client is mocked in the tool-loop test so no real API key or network call is needed.
