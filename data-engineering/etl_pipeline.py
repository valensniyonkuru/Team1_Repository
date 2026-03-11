"""
ETL Pipeline for CommunityBoard Analytics.

Extracts posts/comments/users from the app database,
transforms into analytics-ready aggregates, and loads into analytics tables.
"""

from __future__ import annotations

import os
import pandas as pd
from sqlalchemy import create_engine, text

from config import DATABASE_URL
from logging_utils import get_logger

log = get_logger(name="communityboard_de_etl", log_file="etl_pipeline.log")

engine = create_engine(DATABASE_URL)
 # schema prefix 
ANALYTICS_SCHEMA = os.getenv("ANALYTICS_SCHEMA", "public")

# -------------------------
# Extract
# -------------------------
def extract_posts() -> pd.DataFrame:
    """Extract posts with author + category info."""
    query = text("""
        SELECT p.id, p.title, p.content, p.created_at, p.updated_at, p.author_id,
               p.category_id, u.name  AS author_name, u.email AS author_email, c.name  AS category_name
        FROM posts p
        JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn)


def extract_comments() -> pd.DataFrame:
    """Extract comments with author and post linkage."""
    query = text("""
        SELECT c.id, c.content, c.created_at, c.post_id, c.author_id,
               u.name  AS author_name, u.email AS author_email
        FROM comments c
        JOIN users u ON c.author_id = u.id
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn)


# -------------------------
# Transform
# -------------------------
def transform_daily_activity(posts_df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate post counts by day and category."""
    if posts_df.empty:
        return pd.DataFrame(columns=["date", "category", "post_count"])

    df = posts_df.copy()
    df["date"] = pd.to_datetime(df["created_at"]).dt.date
    df["category_name"] = df["category_name"].fillna("Uncategorized")

    daily = (
        df.groupby(["date", "category_name"])
        .size()
        .reset_index(name="post_count")
        .rename(columns={"category_name": "category"})
        .sort_values(["date", "category"])
        .reset_index(drop=True)
    )
    return daily


def transform_user_engagement(posts_df: pd.DataFrame, comments_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute per-user engagement metrics:
    - posts_created
    - comments_made
    - total_engagement = posts_created + comments_made
    """
    # Build a stable user key: email (unique) + name for readability
    if posts_df.empty and comments_df.empty:
        return pd.DataFrame(columns=["author_email", "author_name", "posts_created", "comments_made", "total_engagement"])

    # Posts per user
    if posts_df.empty:
        post_counts = pd.DataFrame(columns=["author_email", "posts_created"])
    else:
        post_counts = (
            posts_df.groupby("author_email")
            .size()
            .reset_index(name="posts_created")
        )

    # Comments per user
    if comments_df.empty:
        comment_counts = pd.DataFrame(columns=["author_email", "comments_made"])
    else:
        comment_counts = (
            comments_df.groupby("author_email")
            .size()
            .reset_index(name="comments_made")
        )

    # Merge + fill missing with 0
    merged = post_counts.merge(comment_counts, on="author_email", how="outer").fillna(0)

    # Bring back author_name (prefer from posts, else from comments)
    name_map = None
    if not posts_df.empty:
        name_map = posts_df[["author_email", "author_name"]].drop_duplicates()
    if name_map is None or name_map.empty:
        name_map = comments_df[["author_email", "author_name"]].drop_duplicates()

    merged = merged.merge(name_map, on="author_email", how="left")

    # Ensure integer columns
    merged["posts_created"] = merged["posts_created"].astype(int)
    merged["comments_made"] = merged["comments_made"].astype(int)
    merged["total_engagement"] = merged["posts_created"] + merged["comments_made"]

    # Sort: most engaged first
    merged = merged.sort_values(["total_engagement", "posts_created"], ascending=False).reset_index(drop=True)

    # Reorder columns
    merged = merged[["author_email", "author_name", "posts_created", "comments_made", "total_engagement"]]
    return merged


def transform_category_trends(posts_df: pd.DataFrame) -> pd.DataFrame:
    """Total posts per category."""
    if posts_df.empty:
        return pd.DataFrame(columns=["category", "total_posts"])

    df = posts_df.copy()
    df["category_name"] = df["category_name"].fillna("Uncategorized")
    return (
        df.groupby("category_name")
        .size()
        .reset_index(name="total_posts")
        .rename(columns={"category_name": "category"})
        .sort_values("total_posts", ascending=False)
        .reset_index(drop=True)
    )
def transform_top_contributors(user_engagement_df: pd.DataFrame) -> pd.DataFrame:
    """Top 5 most engaged users."""
    if user_engagement_df.empty:
        return pd.DataFrame()
    return user_engagement_df.head(5).reset_index(drop=True)

def transform_content_stats(posts_df: pd.DataFrame) -> pd.DataFrame:
    """Basic content length stats per day (avg title/content length)."""
    if posts_df.empty:
        return pd.DataFrame(columns=["date", "avg_title_len", "avg_content_len"])

    df = posts_df.copy()
    df["date"] = pd.to_datetime(df["created_at"]).dt.date
    df["title_len"] = df["title"].astype(str).str.len()
    df["content_len"] = df["content"].astype(str).str.len()

    stats = (
        df.groupby("date")[["title_len", "content_len"]]
        .mean()
        .reset_index()
        .rename(columns={"title_len": "avg_title_len", "content_len": "avg_content_len"})
        .sort_values("date")
        .reset_index(drop=True)
    )
    # Keeping them as rounded floats 
    stats["avg_title_len"] = stats["avg_title_len"].round(2)
    stats["avg_content_len"] = stats["avg_content_len"].round(2)
    return stats


# -------------------------
# Load
# -------------------------
def load_analytics(df: pd.DataFrame, table_name: str) -> None:
    """Load a dataframe into an analytics table (replace by default)."""
    if df is None:
        log.warning("Skipping load for %s: df is None", table_name)
        return

    full_table = table_name  # schema handling
    df.to_sql(full_table, engine, if_exists="replace", index=False)
    log.warning("Using if_exists='replace' — table %s will be recreated", table_name)
    log.info("Loaded %d rows into %s", len(df), full_table)


# -------------------------
# Pipeline
# -------------------------
def run_pipeline() -> None:
    """Execute extract -> transform -> load for CommunityBoard analytics."""
    log.info("Starting CommunityBoard ETL pipeline...")

    # Extract
    posts_df = extract_posts()
    comments_df = extract_comments()
    log.info("Extracted %d posts, %d comments", len(posts_df), len(comments_df))

    # Transform
    daily_activity = transform_daily_activity(posts_df)
    user_engagement = transform_user_engagement(posts_df, comments_df)
    category_trends = transform_category_trends(posts_df)
    top_contributors = transform_top_contributors(user_engagement)
    content_stats = transform_content_stats(posts_df)

    log.info(
        "Transformed: daily_activity=%d, user_engagement=%d, category_trends=%d, top_contributors=%d, content_stats=%d",
        len(daily_activity), len(user_engagement), len(category_trends), len(top_contributors), len(content_stats)
    )

    # Loading
    load_analytics(daily_activity, "analytics_daily_activity")
    load_analytics(user_engagement, "analytics_user_engagement")
    load_analytics(category_trends, "analytics_category_trends")
    load_analytics(top_contributors, "analytics_top_contributors")
    load_analytics(content_stats, "analytics_content_stats")

    log.info("ETL pipeline complete!")

if __name__ == "__main__":
    run_pipeline()