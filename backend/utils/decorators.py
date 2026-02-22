import functools
import time
from backend.utils.logger import api_logger


def log_execution_time(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        result = await func(*args, **kwargs)
        duration = time.time() - start
        api_logger.info(f"{func.__name__} executed in {duration:.3f}s")
        return result
    return wrapper


def require_subscription(min_plan: str = "free"):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)
        return wrapper
    return decorator
