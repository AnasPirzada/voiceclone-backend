from collections import defaultdict
import time


class MetricsCollector:
    def __init__(self):
        self._counters: dict[str, int] = defaultdict(int)
        self._timers: dict[str, list[float]] = defaultdict(list)

    def increment(self, metric: str, value: int = 1) -> None:
        self._counters[metric] += value

    def record_time(self, metric: str, duration: float) -> None:
        self._timers[metric].append(duration)

    def get_counter(self, metric: str) -> int:
        return self._counters.get(metric, 0)

    def get_avg_time(self, metric: str) -> float:
        times = self._timers.get(metric, [])
        return sum(times) / len(times) if times else 0.0

    def get_all(self) -> dict:
        return {
            "counters": dict(self._counters),
            "timers": {k: {"avg": self.get_avg_time(k), "count": len(v)} for k, v in self._timers.items()},
        }


metrics = MetricsCollector()
