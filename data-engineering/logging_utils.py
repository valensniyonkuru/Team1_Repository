"""
- Console + file logging
- Rotating log files to avoid huge log sizes
- Logging level controlled via LOG_LEVEL env var (default: INFO)
"""

from __future__ import annotations

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path


def get_logger(
    name: str = "communityboard_de",
    log_dir: str = "logs",
    log_file: str = "pipeline.log",
) -> logging.Logger:
    """Return a configured logger with console + optional rotating file handlers."""
    level_str = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_str, logging.INFO)

    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.propagate = False

    if getattr(logger, "_configured", False):
        return logger

    fmt = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    ch = logging.StreamHandler()
    ch.setLevel(level)
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    log_to_file = os.getenv("LOG_TO_FILE", "1") not in ("0", "false", "False")
    if log_to_file:
        Path(log_dir).mkdir(parents=True, exist_ok=True)
        fp = Path(log_dir) / log_file
        fh = RotatingFileHandler(
            fp,
            maxBytes=5_000_000,
            backupCount=3,
            encoding="utf-8",
        )
        fh.setLevel(level)
        fh.setFormatter(fmt)
        logger.addHandler(fh)

    logger._configured = True
    return logger