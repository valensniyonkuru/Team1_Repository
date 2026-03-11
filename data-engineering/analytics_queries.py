"""
Business-facing analytics queries for CommunityBoard.

This module produces the exact deliverables requested in the project brief:
- Posts per category
- Activity trends
- Top contributors

It reads from the analytics tables already created by etl_pipeline.py.
"""

from __future__ import annotations

import os
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text

from config import DATABASE_URL
from logging_utils import get_logger

log = get_logger(name="communityboard_analytics", log_file="analytics_queries.log")

engine = create_engine(DATABASE_URL)

SAVE_OUTPUTS = os.getenv("SAVE_OUTPUTS", "1") not in ("0", "false", "False")
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "outputs"))


# -------------------------
# Query helpers
# -------------------------
def get_posts_per_category() -> pd.DataFrame:
    """Return total post counts by category using analytics_category_trends."""
    query = text("""
        SELECT category, total_posts
        FROM analytics_category_trends
        ORDER BY total_posts DESC, category ASC
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn)


def get_activity_trends() -> pd.DataFrame:
    """Return daily activity trends by category."""
    query = text("""
        SELECT date, category, post_count
        FROM analytics_daily_activity
        ORDER BY date ASC, category ASC
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn)


def get_top_contributors(limit: int = 5) -> pd.DataFrame:
    """Return the top contributors ranked by total engagement."""
    query = text("""
        SELECT author_name, author_email, posts_created, comments_made, total_engagement
        FROM analytics_top_contributors
        ORDER BY total_engagement DESC
        LIMIT :limit
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"limit": limit})

    if not df.empty:
        df.insert(0, "rank", range(1, len(df) + 1))

    return df

def get_most_active_days(limit: int = 10) -> pd.DataFrame:
    """Return the most active posting days by total post count."""
    query = text("""
        SELECT date, SUM(post_count) AS total_posts
        FROM analytics_daily_activity
        GROUP BY date
        ORDER BY total_posts DESC, date ASC
        LIMIT :limit
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn, params={"limit": limit})
    
def get_content_stats() -> pd.DataFrame:
    """Return daily average title and content lengths."""
    query = text("""
        SELECT date,
            avg_title_len, avg_content_len
        FROM analytics_content_stats
        ORDER BY date ASC
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn)


# -------------------------
# Export helpers
# -------------------------
def ensure_output_dir() -> None:
    """Create the output directory when file export is enabled."""
    if SAVE_OUTPUTS:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        log.info("Output export enabled. Files will be saved to %s", OUTPUT_DIR)
    else:
        log.info("Output export disabled. Results will only be printed to console.")


def export_results(df: pd.DataFrame, filename: str) -> None:
    """Export a query result to CSV when SAVE_OUTPUTS is enabled."""
    if not SAVE_OUTPUTS:
        return

    output_path = OUTPUT_DIR / filename
    df.to_csv(output_path, index=False)
    log.info("Exported %d rows to %s", len(df), output_path)


# -------------------------
# Main runner
# -------------------------
def run_analytics_queries() -> None:
    """Run all required analytics queries and optionally export results."""
    log.info("Running CommunityBoard analytics queries...")
    ensure_output_dir()

    posts_per_category = get_posts_per_category()
    activity_trends = get_activity_trends()
    top_contributors = get_top_contributors(limit=5)
    content_stats = get_content_stats()
    most_active_days = get_most_active_days(limit=10)

    log.info("Posts per category rows: %d", len(posts_per_category))
    log.info("Activity trends rows: %d", len(activity_trends))
    log.info("Top contributors rows: %d", len(top_contributors))
    log.info("Content stats rows: %d", len(content_stats))
    log.info("Most active days rows: %d", len(most_active_days))

    export_results(posts_per_category, "posts_per_category.csv")
    export_results(activity_trends, "activity_trends.csv")
    export_results(top_contributors, "top_contributors.csv")
    export_results(content_stats, "content_stats.csv")
    export_results(most_active_days, "most_active_days.csv") 

    log.info("Analytics queries completed successfully.")

    print("\nPosts per Category")
    print(posts_per_category.to_string(index=False))

    print("\nActivity Trends")
    print(activity_trends.head(10).to_string(index=False))

    print("\nTop Contributors")
    print(top_contributors.to_string(index=False))

    print("\nContent Stats")
    print(content_stats.head(10).to_string(index=False))

    print("\nMost Active Days")
    print(most_active_days.to_string(index=False)) 

if __name__ == "__main__":
    run_analytics_queries()