from prometheus_client import Counter, Gauge

alerts_detected = Counter(
    'fuel_alerts_detected_total',
    'Total shortage alerts detected by monitoring agent',
    ['risk_level']
)

decisions_submitted = Counter(
    'fuel_decisions_submitted_total',
    'Total allocation decisions submitted to simulator'
)

fallback_activations = Counter(
    'fuel_fallback_activations_total',
    'Times Redis cache fallback was served instead of live simulator'
)

circuit_breaker_open = Gauge(
    'fuel_circuit_breaker_open',
    'Circuit breaker state: 1=open (simulator isolated), 0=closed (healthy)'
)
