"""
File storage abstraction (Milestone 2).

`StorageBackend` is the port; `LocalFileStorage` is the only adapter
implemented for now. Swapping to S3 or Azure Blob Storage later means
adding a new adapter class and changing one line in `get_storage_backend()`
— no service or API code needs to change (Dependency Inversion Principle).
"""
import logging
import uuid
from abc import ABC, abstractmethod
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import ValidationFailedError

logger = logging.getLogger("app.services.storage")

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"}
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class StorageBackend(ABC):
    @abstractmethod
    async def save(self, file: UploadFile, subfolder: str) -> str:
        """Persist the uploaded file and return a URL/path clients can use to fetch it."""

    @abstractmethod
    def delete(self, url: str) -> None:
        """Remove a previously stored file. Should not raise if it no longer exists."""


class LocalFileStorage(StorageBackend):
    """Stores files on local disk under `UPLOAD_ROOT`, served statically by
    the API at `/uploads/...` (see `main.py`'s StaticFiles mount)."""

    def __init__(self, upload_root: str | None = None, public_prefix: str | None = None):
        self.upload_root = Path(upload_root or settings.UPLOAD_ROOT)
        self.public_prefix = public_prefix or settings.UPLOAD_PUBLIC_PREFIX
        self.upload_root.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile, subfolder: str) -> str:
        extension = Path(file.filename or "").suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise ValidationFailedError(
                f"Unsupported file type '{extension}'. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
            )

        contents = await file.read()
        if len(contents) > MAX_UPLOAD_SIZE_BYTES:
            raise ValidationFailedError("File exceeds the maximum allowed size of 10 MB.")

        target_dir = self.upload_root / subfolder
        target_dir.mkdir(parents=True, exist_ok=True)

        stored_filename = f"{uuid.uuid4().hex}{extension}"
        target_path = target_dir / stored_filename

        with open(target_path, "wb") as f:
            f.write(contents)

        logger.info("Stored upload at %s (%d bytes)", target_path, len(contents))
        return f"{self.public_prefix}/{subfolder}/{stored_filename}"

    def delete(self, url: str) -> None:
        if not url or not url.startswith(self.public_prefix):
            return
        relative_path = url[len(self.public_prefix):].lstrip("/")
        target_path = self.upload_root / relative_path
        try:
            target_path.unlink(missing_ok=True)
            logger.info("Deleted stored file at %s", target_path)
        except OSError:
            logger.exception("Failed to delete stored file at %s", target_path)


_storage_backend: StorageBackend | None = None


def get_storage_backend() -> StorageBackend:
    """FastAPI-dependency-friendly singleton accessor. Swap the concrete
    class here (e.g. `S3Storage()`) to change storage providers platform-wide."""
    global _storage_backend
    if _storage_backend is None:
        _storage_backend = LocalFileStorage()
    return _storage_backend
