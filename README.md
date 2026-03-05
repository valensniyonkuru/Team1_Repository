
# Team1_Repository
=======
# CommunityBoard
**AmaliTech Group Project – Full-Stack Teams (Teams 1-5)**

A community notice board where users can post announcements, events, and discussions. Supports categories, comments, and search.

## Tech Stack
- **Backend:** Java 17 + Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **Frontend:** React 18, React Router, Axios, Chart.js
- **Data Engineering:** Python ETL pipeline, analytics aggregation
- **QA:** REST Assured (API), Selenium WebDriver (UI)
- **DevOps:** Docker, docker-compose, GitHub Actions CI

## Getting Started
```bash
docker-compose up --build
```
- Backend API: http://localhost:8080/swagger-ui.html
- Frontend: http://localhost:3000

## Default Users (seeded)
| Email | Password | Role |
|---|---|---|
| admin@amalitech.com | password123 | ADMIN |
| user@amalitech.com | password123 | USER |

## Project Structure
```
backend/          - Spring Boot REST API
frontend/         - React 18 SPA
data-engineering/ - Python ETL & analytics
qa/               - API & UI test suites
devops/           - Docker, CI/CD configs
```

## What's Implemented (~30%)
- [x] User authentication (register/login with JWT)
- [x] Basic post CRUD (create, read, update, delete)
- [x] Category management
- [ ] Comments system (TODO)
- [ ] Search & filtering (TODO)
- [ ] User profiles (TODO)
- [ ] Notifications (TODO)
- [ ] Analytics dashboard (TODO)

## Git Workflow (Feature Branches)

To keep `main` stable, everyone should work on feature branches and use pull requests:

1. **Start from the latest `main`**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a feature branch from `main`**
   ```bash
   git checkout -b feature/<short-description>
   # examples:
   # git checkout -b feature/add-login
   # git checkout -b bugfix/fix-pagination
   ```

3. **Do your work and commit**
   ```bash
   # edit files...
   git status
   git add <files>        # or: git add .
   git commit -m "Short summary of change"
   ```

4. **Push the feature branch to GitHub**
   ```bash
   git push -u origin feature/<short-description>
   ```

5. **Open a Pull Request**
   - On GitHub, open a PR **from** `feature/<short-description>` **into** `main` .

   - Get **1 approval** (required by branch protection) before merging.

6. **Merge and clean up**
   - Merge the PR via GitHub.
   - Optionally delete the remote branch in the PR UI.
   - Update your local `main` and delete the local feature branch:
     ```bash
     git checkout main
     git pull origin main
     git branch -d feature/<short-description>
     ```

