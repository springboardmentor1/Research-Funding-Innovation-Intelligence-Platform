"""
Application-wide exception hierarchy and FastAPI exception handlers.

Using typed domain exceptions instead of raising HTTPException directly
inside services keeps the service layer transport-agnostic (Clean
Architecture) while the API layer maps exceptions to HTTP responses.
"""
import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("app")


class AppException(Exception):
    """Base class for all predictable, handled application errors."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None):
        self.message = message or self.message
        super().__init__(self.message)


class NotFoundError(AppException):
    status_code = status.HTTP_404_NOT_FOUND
    message = "Resource not found."


class AlreadyExistsError(AppException):
    status_code = status.HTTP_409_CONFLICT
    message = "Resource already exists."


class InvalidCredentialsError(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "Invalid email or password."


class InactiveUserError(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    message = "This account has been deactivated."


class TokenError(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "Could not validate credentials."


class PermissionDeniedError(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    message = "You do not have permission to perform this action."


class ValidationFailedError(AppException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    message = "Validation failed."


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.warning("Handled exception on %s %s: %s", request.method, request.url.path, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.message, "path": str(request.url.path)},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Internal server error. Please try again later.",
                "path": str(request.url.path),
            },
        )
