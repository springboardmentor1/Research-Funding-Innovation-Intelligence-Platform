"""
Application logging configuration. Produces structured, timestamped logs
to stdout so they can be collected by Docker / any log aggregator.
"""
import logging
import sys

from app.core.config import settings


def configure_logging() -> None:
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers = [handler]

    # Tame noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.ERROR)

    logging.getLogger("app").info("Logging configured at level %s", settings.LOG_LEVEL)
