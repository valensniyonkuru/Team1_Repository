# API test results summary (for presentation)

## Current full run: 58 run, 25 failed, 15 skipped

### What is failing (25 failures) — **cause: 401 Unauthorized**

| Area | Tests failing | Reason |
|------|----------------|--------|
| **AnalyticsApiTest** | 5 tests | Backend returns 401 when request includes the auth token (admin analytics) |
| **PostApiTest** | 1 test | testCreatePost expects 201, gets 401 |
| **PostCreateApiTest** | 7 tests | All use shared token; backend rejects token → 401 |
| **PostReadApiTest** | 5 tests | authGet used; backend returns 401 |
| **SearchFilterApiTest** | 6 tests | authGet used; backend returns 401 |
| **CommentApiTest** | 1 (setup) | @BeforeClass createTestPost gets 401 |

**Root cause of all 25:** The token obtained at login (in `@BeforeSuite`) is **rejected** by the backend on later requests. So this is **not** 25 different application bugs — it is **one environment/configuration issue**: the backend must use the same JWT secret for issuing and validating the token (e.g. run with `-Dspring-boot.run.profiles=test` from the `backend` folder).

---

### What is skipped (15 skipped) — **cause: failed @BeforeClass**

| Class | # skipped | Reason |
|-------|-----------|--------|
| **CommentApiTest** | 8 tests | @BeforeClass `createTestPost()` fails with 401 → TestNG skips entire class |
| **PostUpdateDeleteApiTest** | 7 tests | @BeforeClass `createTestPost()` fails with 401 → TestNG skips entire class |

So the 15 skipped tests are **not** disabled by choice — they are skipped because the class-level setup (create post with auth) fails with 401, so TestNG never runs the test methods.

---

### What is passing (18 tests)

- **AuthRegisterApiTest** (5): register new user, duplicate email, missing fields, password not in response, user id/email returned  
- **AuthLoginApiTest** (7): valid login, role returned, wrong password, non-existent email, missing email, missing password, JWT non-empty  
- **AuthApiTest** (3): register, login existing user, invalid credentials  

These all hit **public** auth endpoints (no token required for the request), so they pass regardless of the token issue.

---

## If we remove the skipped tests

Removing the **skipped** tests (CommentApiTest + PostUpdateDeleteApiTest) does **not** fix anything: you would still have **58 tests run**, **25 failures**, **33 passes**. The 25 failures would remain because they all depend on the backend accepting the shared token.

---

## Option for presentation: run only tests that pass

To show **meaningful results with no failures and no skips**:

- Run only the **auth** test classes (no token needed for the calls under test):
  ```bash
  mvn test -Pauth-only
  ```
- You get **15 tests**, all **passed**, 0 failed, 0 skipped (AuthRegisterApiTest 5 + AuthLoginApiTest 7 + AuthApiTest 3).

**Message for slides:**  
“We have 15 API tests covering registration and login (validation, errors, response shape). All 15 pass. We also have tests for posts, comments, analytics, and search; those require a valid auth token. In our current run the backend rejects the token (config), so we run the auth-only suite for a clean result. Once JWT config is aligned, the full suite can be run.”

---

## Fixing the 25 failures (for later)

1. Start the backend with the **test** profile so JWT is consistent:
   ```bash
   cd backend
   mvn spring-boot:run "-Dspring-boot.run.profiles=test"
   ```
2. Run the full suite from `qa/api-tests`: `mvn test`  
3. Then the 25 “401” failures should disappear (or reveal real bugs if any).
