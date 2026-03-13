# Data Engineering — CommunityBoard

## Overview

The data engineering layer is responsible for seeding the application database with realistic test data, running an ETL pipeline to compute analytics aggregates, and providing business-facing analytics queries with CSV exports.

---
## Data Flow Architecture

![CommunityBoard Data Flow Architecture](docs/data-workflow.png)


## Project Structure
```
data-engineering/
├── docs                  # for the data flow architecture documents
├── seed_data.py          # Seeds users, posts, comments into the app DB
├── etl_pipeline.py       # Extracts, transforms, and loads analytics tables
├── analytics_queries.py  # Business-facing queries and CSV exports
├── config.py             # Database URL configuration
├── logging_utils.py      # Shared logging setup
├── requirements.txt      # Python dependencies
└── Dockerfile            # ETL container definition
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string | Built from DB_* vars |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password | — |
| `SEED_RESET` | If `1`, truncates existing data before seeding | `1` |
| `N_USERS` | Number of users to seed | `25` |
| `N_POSTS` | Number of posts to seed | `60` |
| `N_COMMENTS` | Number of comments to seed | `240` |
| `SEED` | Random seed for reproducibility | `2605` |
| `SAVE_OUTPUTS` | If `1`, exports analytics CSVs to `outputs/` | `1` |
| `OUTPUT_DIR` | Directory for CSV exports | `outputs` |
| `ANALYTICS_SCHEMA` | PostgreSQL schema for analytics tables | `public` |

---

## Prerequisites

- Docker and Docker Compose installed
- Backend must be running first so Hibernate creates the database schema and sequences
- Categories (`NEWS`, `EVENT`, `DISCUSSION`, `ALERT`) are auto-created by the seed if they don't exist

---

## Running the Data Pipeline

> **Important:** Always run the backend first before seeding so the schema and sequences are created.

### 1. Start all services
```bash
docker compose up -d --build
```

### 2. Verify backend is healthy
```bash
docker compose ps
```

Wait until `communityboard-backend-dev` shows `healthy`.

### 3. Seed the database
```bash
docker compose run --rm etl python seed_data.py
```

To seed against a specific database (e.g. staging):
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname docker compose run --rm --no-deps etl python seed_data.py
```

To append without truncating existing data:
```bash
SEED_RESET=0 docker compose run --rm etl python seed_data.py
```

### 4. Run the ETL pipeline
```bash
docker compose run --rm etl python etl_pipeline.py
```

### 5. Run analytics queries and export CSVs
```bash
docker compose run --rm etl python analytics_queries.py
```

CSV outputs will be saved to `data-engineering/outputs/`.

---

## Seed Data

The seed script generates realistic, reproducible test data using a fixed random seed (`SEED=2605`).

### Users (`N_USERS=25`)
- 2 fixed accounts always included:
  - `admin@amalitech.com` — role: `ADMIN`
  - `user@amalitech.com` — role: `USER`
  - Password for both: `Password123!`
- 23 randomly generated users with role: `USER`

### Categories
The seed ensures these 4 categories exist before inserting posts based on just the names:

| ID | Name | Description |
|---|---|---|
| 1 | NEWS | Community news and announcements |
| 2 | EVENT | Upcoming events and activities |
| 3 | DISCUSSION | Open community discussions |
| 4 | ALERT | Urgent notices and warnings |

### Posts (`N_POSTS=60`)
- Minimum 10 posts per category guaranteed
- Posts span the last 180 days
- Titles and content are category-specific and keyword-rich for search realism

### Comments (`N_COMMENTS=240`)
- Linked to random posts and users
- Comment timestamps are always after the post they belong to — no comment can predate its post


---
## Source Schema

The seed targets these application tables created by the backend (Hibernate/JPA):

| Table | Key Columns |
|---|---|
| `users` | `id`, `email`, `name`, `role`, `auth_provider`, `account_locked`, `email_verified`, `token_version`, `created_at`, `updated_at`, `deleted_at` |
| `posts` | `id`, `title`, `content`, `author_id`, `category_id`, `created_at`, `updated_at`, `deleted_at` |
| `comments` | `id`, `content`, `author_id`, `post_id`, `created_at` |
| `categories` | `id`, `name`, `description` |

> The backend creates all sequences and constraints.
---
## ETL Pipeline

The ETL pipeline (`etl_pipeline.py`) reads from the application tables and computes analytics aggregates, loading them into dedicated analytics tables.

```
App DB (posts, users, comments, categories)
        ↓  extract (SQL)
    Pandas DataFrames
        ↓  transform (Python)
    Aggregated DataFrames
        ↓  load (TRUNCATE + append)
Analytics Tables
```

Each run **truncates then reloads** all analytics tables to ensure data is always current and never duplicated. Analytics tables are read-only for the backend and should never be written to directly.

### Analytics Tables

| Table | Description | Expected Rows |
|---|---|---|
| `analytics_daily_activity` | Post counts per day per category | ~59 |
| `analytics_user_engagement` | Per-user posts, comments, and total engagement | 25 |
| `analytics_category_trends` | Total posts per category | 4 |
| `analytics_top_contributors` | Top 10 most engaged users | 10 |
| `analytics_content_stats` | Average title and content length per day | ~52|
| `analytics_posts_day_of_week` | Post counts grouped by day of week | 7 |


---

## Analytics Queries

The analytics queries module (`analytics_queries.py`) reads from the analytics tables and produces the business deliverables required by the project brief.

## Analytics Queries

The analytics queries module (`analytics_queries.py`) reads from the analytics tables and produces the business deliverables required by the project brief.

| Query | Description | CSV Export |
|---|---|---|
| `get_posts_per_category()` | Total post counts by category | `posts_per_category.csv` |
| `get_activity_trends()` | Daily post counts by category | `activity_trends.csv` |
| `get_top_contributors()` | Top 10 users ranked by total engagement | `top_contributors.csv` |
| `get_most_active_days()` | Top 10 days by total post count | `most_active_days.csv` |
| `get_content_stats()` | Average title and content length per day | `content_stats.csv` |
| `get_posts_by_day_of_week()` | Post counts grouped by day of week | `posts_day_of_week.csv` |

---

## Expected Values (QA Reference)

Based on seed `SEED=2605`, `N_USERS=25`, `N_POSTS=60`, `N_COMMENTS=240`:

### Posts per Category

| Category | Total Posts |
|---|---|
| DISCUSSION | 18 |
| EVENT | 16 |
| NEWS | 14 |
| ALERT | 12 |

### Top 10 Contributors

| Rank | Name | Posts | Comments | Total |
|---|---|---|---|---|
| 1 | Taylor Flores | 5 | 14 | 19 |
| 2 | Jolly Burabyo | 4 | 13 | 17 |
| 3 | John Chavez | 2 | 15 | 17 |
| 4 | Rodney Bauer | 4 | 11 | 15 |
| 5 | Mark Mcclain | 4 | 11 | 15 |
| 6 | Ryan Green | 4 | 10 | 14 |
| 7 | Shannon Henderson | 2 | 12 | 14 |
| 8 | Jennifer Morris | 4 | 9 | 13 |
| 9 | Jill Walsh | 2 | 10 | 12 |
| 10 | Sharon Brady | 2 | 10 | 12 |

### Posts by Day of Week

| Day | Post Count |
|---|---|
| Friday | 14 |
| Tuesday | 10 |
| Sunday | 9 |
| Thursday | 9 |
| Monday | 8 |
| Wednesday | 6 |
| Saturday | 4 |

---

## Notes
- Analytics tables are created automatically on the first ETL run if they don't exist
- Each ETL run truncates and reloads all analytics tables — never write to them directly
- The backend should only query analytics tables via `SELECT`
- Seed data is fully reproducible — the same `SEED` value always produces the same data
- Running seed against a shared staging DB with `SEED_RESET=1` will truncate other teams' data — coordinate before running
- Use `SEED_RESET=0` to append data without truncating existing records
- Use `--no-deps` flag when running ETL against staging to bypass the backend health check dependency
- Coordinate with the team before running seed against staging to avoid data conflicts
