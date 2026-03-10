import os
import random
from datetime import datetime, timedelta
from typing import List

import pandas as pd
from faker import Faker
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection

from config import DATABASE_URL
from logging_utils import get_logger

log = get_logger(name="communityboard_de_seed", log_file="seed_data.log")

# Reproducibility
SEED = int(os.getenv("SEED", "2605"))
RNG = random.Random(SEED)
fake = Faker()
fake.seed_instance(SEED)

# Behavior toggles
SEED_RESET = os.getenv("SEED_RESET", "1") not in ("0", "false", "False")

# Volumes (can be overridden from env)
N_USERS = int(os.getenv("N_USERS", "25"))
N_POSTS = int(os.getenv("N_POSTS", "60"))
N_COMMENTS = int(os.getenv("N_COMMENTS", "240"))

engine = create_engine(DATABASE_URL)


def rand_ts(days_back: int = 30) -> datetime:
    """Return a random UTC timestamp in the last `days_back` days."""
    now = datetime.utcnow()
    return now - timedelta(
        days=RNG.randint(0, days_back),
        hours=RNG.randint(0, 23),
        minutes=RNG.randint(0, 59),
    )


def require_categories(conn: Connection) -> List[int]:
    """Fetch category IDs and fail fast if categories are missing."""
    rows = conn.execute(text("SELECT id FROM categories ORDER BY id;")).fetchall()
    ids = [r[0] for r in rows]
    if not ids:
        raise RuntimeError("No categories found. Start backend so it seeds categories via data.sql.")
    return ids


def clear_existing_data(conn: Connection) -> None:
    """Truncate users/posts/comments to get a clean, repeatable seed run."""
    # Order matters due to foreign keys
    conn.execute(text("TRUNCATE TABLE comments RESTART IDENTITY CASCADE;"))
    conn.execute(text("TRUNCATE TABLE posts RESTART IDENTITY CASCADE;"))
    conn.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE;"))


def upsert_users(conn: Connection, n_users: int) -> List[int]:
    """Insert or update users by unique email; returns all user IDs."""
    users = []

    # Ensure at least one admin
    for i in range(n_users):
        role = "ADMIN" if i == 0 else "USER"
        users.append(
            {
                "created_at": rand_ts(60),
                "email": fake.unique.email(),
                "name": fake.name(),
                # This is NOT for app login (backend expects hashed passwords on registration).
                "password": "seeded_password_not_for_login",
                "role": role,
            }
        )

    # UPSERT row-by-row for correctness (email is unique); n_users is small.
    sql = text("""
        INSERT INTO users (created_at, email, name, password, role)
        VALUES (:created_at, :email, :name, :password, :role)
        ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            role = EXCLUDED.role
    """)

    for row in users:
        conn.execute(sql, row)

    # Return current IDs (all users in table)
    ids = [r[0] for r in conn.execute(text("SELECT id FROM users ORDER BY id;")).fetchall()]
    return ids


def insert_posts(conn: Connection, user_ids: List[int], category_ids: List[int], n_posts: int) -> List[int]:
    """Insert posts linked to existing users and categories; returns post IDs."""
    posts = []
    for _ in range(n_posts):
        created_at = rand_ts(30)
        posts.append(
            {
                "content": fake.paragraph(nb_sentences=3),
                "created_at": created_at,
                "title": fake.sentence(nb_words=6).rstrip("."),
                "updated_at": created_at + timedelta(hours=RNG.randint(0, 72)),
                "author_id": RNG.choice(user_ids),
                "category_id": RNG.choice(category_ids),
            }
        )

    df = pd.DataFrame(posts)
    df.to_sql("posts", conn, if_exists="append", index=False, method="multi")

    post_ids = [r[0] for r in conn.execute(text("SELECT id FROM posts ORDER BY id;")).fetchall()]
    return post_ids


def insert_comments(conn: Connection, user_ids: List[int], post_ids: List[int], n_comments: int) -> None:
    """Insert comments linked to existing posts and users."""
    comments = []
    for _ in range(n_comments):
        comments.append(
            {
                "content": fake.sentence(nb_words=10).rstrip("."),
                "created_at": rand_ts(30),
                "author_id": RNG.choice(user_ids),
                "post_id": RNG.choice(post_ids),
            }
        )

    df = pd.DataFrame(comments)
    df.to_sql("comments", conn, if_exists="append", index=False, method="multi")


def log_counts(conn: Connection) -> None:
    """Log row counts for sanity checks."""
    counts = conn.execute(
        text("""
            SELECT
              (SELECT COUNT(*) FROM users)    AS users,
              (SELECT COUNT(*) FROM posts)    AS posts,
              (SELECT COUNT(*) FROM comments) AS comments
        """)
    ).fetchone()
    log.info("Row counts -> users=%s posts=%s comments=%s", counts[0], counts[1], counts[2])


def main() -> None:
    """Run the seeding workflow: optional reset, upsert users, insert posts/comments."""
    log.info("Starting seeding (SEED=%s, SEED_RESET=%s)...", SEED, SEED_RESET)
    log.info("Target DB: %s", DATABASE_URL.replace(os.getenv("DB_PASSWORD", ""), "***") if os.getenv("DB_PASSWORD") else DATABASE_URL)

    with engine.connect() as conn:
        # Autocommit for TRUNCATE + small inserts
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")

        category_ids = require_categories(conn)

        if SEED_RESET:
            log.info("SEED_RESET=1 -> truncating users/posts/comments for a clean seed run...")
            clear_existing_data(conn)
        else:
            log.info("SEED_RESET=0 -> appending (no truncation). Users will UPSERT by email.")

        log.info("Upserting %d users...", N_USERS)
        user_ids = upsert_users(conn, N_USERS)
        log.info("Users available in table: %d", len(user_ids))

        log.info("Inserting %d posts...", N_POSTS)
        post_ids = insert_posts(conn, user_ids, category_ids, N_POSTS)
        log.info("Posts available in table: %d", len(post_ids))

        log.info("Inserting %d comments...", N_COMMENTS)
        insert_comments(conn, user_ids, post_ids, N_COMMENTS)

        log_counts(conn)
        log.info("Seeding finished successfully.")


if __name__ == "__main__":
    main()