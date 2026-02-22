class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class NotFoundError(AppException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)


class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail)


class ForbiddenError(AppException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail)


class ValidationError(AppException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=422, detail=detail)


class RateLimitError(AppException):
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(status_code=429, detail=detail)


class StorageError(AppException):
    def __init__(self, detail: str = "Storage operation failed"):
        super().__init__(status_code=500, detail=detail)


class AIEngineError(AppException):
    def __init__(self, detail: str = "AI engine error"):
        super().__init__(status_code=500, detail=detail)


class BillingError(AppException):
    def __init__(self, detail: str = "Billing error"):
        super().__init__(status_code=402, detail=detail)
