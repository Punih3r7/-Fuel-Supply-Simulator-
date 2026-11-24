"""
Circuit breaker - tracks simulator failures and opens the circuit
after 3 consecutive failures so the system stops hammering a dead simulator
and switches to Redis cache automatically.
"""

import time
from enum import Enum


class State(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, recovery_timeout: int = 30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = State.CLOSED

    def record_success(self):
        self.failure_count = 0
        self.state = State.CLOSED

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = State.OPEN

    def is_open(self) -> bool:
        if self.state == State.OPEN:
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = State.HALF_OPEN
                return False
            return True
        return False

    def status(self) -> str:
        return self.state.value


circuit_breaker = CircuitBreaker()
