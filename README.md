# CommunityBoard
**AmaliTech Group Project – Full-Stack Teams (Teams 1-5)**

A community notice board where users can post announcements, events, and discussions. Supports categories, comments, and search.

## Tech Stack
- **Backend:** Java 17 + Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **Frontend:** React 18, React Router, Axios, Chart.js
- **Data Engineering:** Python ETL pipeline, analytics aggregation
- **QA:** REST Assured (API), Selenium WebDriver (UI)
- **DevOps:** Docker, docker-compose, GitHub Actions CI, Terraform, AWS EC2

---

## 🚀 Developer Setup & Workflow

Welcome to the team! Our unified developer workflow ensures high-quality, continuous integration, and safe deployments. Please read carefully before writing any code.

### 1️⃣ Clone and Initialize Setup
Start by cloning the repository and initializing the local environment configuration:
```bash
git clone https://github.com/valensniyonkuru/Team1_Repository.git
cd Team1_Repository

# Install Git Pre-Commit Hooks (Crucial!)
make init-hooks
```
**Why run `make init-hooks`?**  
This copies native Git hooks located in `scripts/git-hooks/` into your local `.git/hooks/` folder. It prevents you from committing directly to the `main` branch, scanning for secret leaks, and evaluating large files before pushing.

### 2️⃣ Start Local Development Environment
The local environment is unified using Docker Compose:
```bash
# Builds images and runs the stack in the background
docker-compose up --build -d
```
- **Backend API:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **React Frontend:** [http://localhost:3000](http://localhost:3000)
- **Database Logs:** `docker-compose logs -f postgres`

### 3️⃣ Feature Branching Strategy
We adhere strictly to a **Feature Branch Workflow**. `main` is equivalent to our production environment and is completely locked from direct commits.

```bash
# Branch off from main into a new feature branch
git checkout main
git pull

# Name it semantic: feat/xxx, fix/xxx, test/xxx
git checkout -b feat/add-user-registration
```

### 4️⃣ The Contribution Loop
1. **Write Code**: Implement your feature or fix in your active branch.
2. **Local Commits**: When running `git commit -m "feat: your feature"`, the active **pre-commit** hook will:
   - Validate you aren't on the `main` branch.
   - Scan modified code for embedded tokens, secrets, or passwords.
   - Restrict gigantic file commits entirely.
3. **Push Feature Branch:**
   ```bash
   git push origin feat/add-user-registration
   ```
4. **Open a Pull Request:**
   Go to GitHub and create a Pull Request from `feat/xxxx` into `main`. The CI/CD pipeline will immediately execute unit testing, health validations, and docker-build verifications securely within the runner!
5. **Merge & Deploy:**
   Once passed and peer-reviewed, merging your PR into `main` automatically triggers our production Continuous Deployment (CD) pipeline directly to AWS EC2! 

---

## 🛠️ Infrastructure Overview

```text
/
├── .github/workflows/    # CI/CD: Testing, Build logic, AWS Instance Connect
├── backend/              # Spring Boot REST API
├── data-engineering/     # Python Analytics & ETL
├── frontend/             # Nginx + React SPA
├── qa/                   # API/UI Integration tests
├── scripts/git-hooks/    # Developer Git Guardrails
├── terraform/            # Infrastructure State Configuration
├── docker-compose.yml    # Development Architecture
├── Makefile              # Essential automation shorthand
```

## 👩‍💻 Default Seed Users
| Email | Password | Role |
|-------|----------|------|
| admin@amalitech.com | password123 | ADMIN |
| user@amalitech.com | password123 | USER |

---
*Happy Coding! 🚀*
