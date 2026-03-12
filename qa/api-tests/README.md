# CommunityBoard API Tests

REST Assured + TestNG tests against the CommunityBoard backend.

## Prerequisites

1. **Backend running** (default `http://localhost:8080`; override with `QA_BASE_URI`).
2. **Run the backend with the test profile** so the JWT secret matches when issuing and validating tokens (otherwise authenticated requests get 401). From the **repository root** (the folder that contains `backend` and `qa`), run:
   ```bash
   cd backend
   mvn spring-boot:run "-Dspring-boot.run.profiles=test"
   ```
   So if you are in `qa\api-tests`, go up twice first: `cd ..\..` then `cd backend`. The Spring Boot plugin lives in the backend module only—do not run `mvn spring-boot:run` from the repo root or from qa/api-tests.
   Or set `SPRING_PROFILES_ACTIVE=test` in the environment before starting the backend.
3. **Restart the backend** after pulling latest changes so that:
   - `data.sql` seeds categories on startup
   - `TestAdminSeeder` (test profile) creates `admin@amalitech.com` / `QAAdmin@123` if no admin exists
   - Register is resilient to Redis/mail failures
   - `GET /api/analytics` is available (admin-only)

## Run tests

From the **qa/api-tests** folder (not from backend):

```bash
cd c:\Users\user\Downloads\Team1_Repository\qa\api-tests
mvn test
```

Optional env: `QA_BASE_URI`, `QA_ADMIN_EMAIL`, `QA_ADMIN_PASS`. Defaults use `admin@amalitech.com` / `QAAdmin@123` (created by TestAdminSeeder when backend runs with test profile).

## If register returns 500

1. **Rebuild and restart the backend** from the **backend** folder (not from repo root or qa/api-tests). From repo root: `cd backend`, then:
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```
   Or use the full path to backend: `cd c:\Users\user\Downloads\Team1_Repository\backend`
2. With **test** profile, the 500 response body now includes the real exception (e.g. `RedisConnectionException: Connection refused`). Use that to fix config (e.g. Redis) or ensure AuthService try-catch is in place.
3. In a **different terminal**, run tests from the api-tests folder:
   ```bash
   cd c:\Users\user\Downloads\Team1_Repository\qa\api-tests
   mvn test
   ```

## If you see 401 on authenticated requests ("Token rejected")

The backend must use the **same JWT config** when issuing (login) and validating (later requests) the token. Run the backend with the test profile **from the repository root** (then into `backend`):

```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=test"
```
(If your shell is in `qa\api-tests`, run `cd ..\..` first so you are in the repo root, then `cd backend`.)

If you run against a remote server (`QA_BASE_URI`), ensure that server uses the same JWT secret as when the token was issued (e.g. same profile or env).

## If you see "No categories in DB"

Ensure the backend has been restarted so `data.sql` runs (or run `scripts/seed-categories.sql` against the same DB the backend uses).
