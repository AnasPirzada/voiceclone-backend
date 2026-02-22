from dataclasses import dataclass, field
from datetime import datetime
import psutil


@dataclass
class SystemMetrics:
    cpu_percent: float = 0.0
    memory_percent: float = 0.0
    disk_usage_percent: float = 0.0
    gpu_available: bool = False
    gpu_memory_used: float = 0.0
    timestamp: datetime = field(default_factory=datetime.utcnow)


class MonitoringService:
    def get_system_metrics(self) -> SystemMetrics:
        metrics = SystemMetrics(
            cpu_percent=psutil.cpu_percent(),
            memory_percent=psutil.virtual_memory().percent,
            disk_usage_percent=psutil.disk_usage("/").percent,
        )
        try:
            import torch
            metrics.gpu_available = torch.cuda.is_available()
            if metrics.gpu_available:
                metrics.gpu_memory_used = torch.cuda.memory_allocated() / torch.cuda.max_memory_allocated() * 100
        except ImportError:
            pass
        return metrics
