"""Domain service exceptions mapped to HTTP responses."""

from typing import Optional, Dict, Any


class FlowGuardServiceException(Exception):
    """Base exception for FlowGuard services."""
    def __init__(self, message: str, code: str = "FLOWGUARD_ERROR", status_code: int = 400, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class EntityNotFoundError(FlowGuardServiceException):
    """Raised when an entity requested by ID does not exist."""
    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            message=f"{entity_name} with identifier '{entity_id}' was not found.",
            code=f"{entity_name.upper()}_NOT_FOUND",
            status_code=404,
            details={"entity": entity_name, "id": entity_id},
        )


class InvalidParameterError(FlowGuardServiceException):
    """Raised when client input violates query constraints."""
    def __init__(self, message: str, parameter: str):
        super().__init__(
            message=message,
            code="INVALID_PARAMETER",
            status_code=422,
            details={"parameter": parameter},
        )
