import time
from datetime import datetime, timezone
from data.evaluation_dataset import EVALUATION_DATASET
from models.schemas import (
    EvaluationResponse,
    EvaluationMetrics,
    EvaluationCaseResult,
    VerifyRequest,
    VerificationVerdict,
)
from services.verification_service import run_verification_pipeline

def run_evaluation_benchmark() -> EvaluationResponse:
    """
    Executes all scenarios in the evaluation dataset in-process without network overhead.
    Computes measured latency and empirical verification impact metrics.
    """
    case_results: list[EvaluationCaseResult] = []
    latencies: list[float] = []

    true_positives = 0   # Expected DIVERGENCE, got DIVERGENCE
    false_positives = 0  # Expected VERIFIED, got DIVERGENCE
    true_negatives = 0   # Expected VERIFIED, got VERIFIED
    false_negatives = 0  # Expected DIVERGENCE, got VERIFIED

    expected_verified_count = 0
    actual_verified_pass_count = 0

    for scenario in EVALUATION_DATASET:
        req = VerifyRequest(
            source_artifact=scenario.source_artifact,
            generated_artifact=scenario.generated_artifact,
        )

        start_time = time.perf_counter()
        verification_response = run_verification_pipeline(req)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        latencies.append(elapsed_ms)

        actual_verdict = verification_response.verdict
        is_correct = (actual_verdict == scenario.expected_verdict)

        if scenario.expected_verdict == VerificationVerdict.VERIFIED:
            expected_verified_count += 1
            if actual_verdict == VerificationVerdict.VERIFIED:
                true_negatives += 1
                actual_verified_pass_count += 1
            elif actual_verdict == VerificationVerdict.DIVERGENCE_DETECTED:
                false_positives += 1
        elif scenario.expected_verdict == VerificationVerdict.DIVERGENCE_DETECTED:
            if actual_verdict == VerificationVerdict.DIVERGENCE_DETECTED:
                true_positives += 1
            elif actual_verdict == VerificationVerdict.VERIFIED:
                false_negatives += 1

        case_results.append(
            EvaluationCaseResult(
                scenario_id=scenario.scenario_id,
                title=scenario.title,
                category=scenario.category,
                expected_verdict=scenario.expected_verdict,
                actual_verdict=actual_verdict,
                correct=is_correct,
                latency_ms=round(elapsed_ms, 2),
                expected_divergence_type=scenario.expected_divergence_type,
                actual_divergences_count=len(verification_response.divergences),
            )
        )

    total_cases = len(EVALUATION_DATASET)
    total_correct = sum(1 for c in case_results if c.correct)

    # Metric calculations (defensive division by zero checks)
    detection_accuracy = (total_correct / total_cases) if total_cases > 0 else 0.0
    pass_rate = (actual_verified_pass_count / expected_verified_count) if expected_verified_count > 0 else 0.0

    expected_negatives = true_negatives + false_positives
    fpr = (false_positives / expected_negatives) if expected_negatives > 0 else 0.0

    expected_positives = true_positives + false_negatives
    fnr = (false_negatives / expected_positives) if expected_positives > 0 else 0.0

    mean_latency = (sum(latencies) / len(latencies)) if latencies else 0.0

    return EvaluationResponse(
        dataset_name="Hallucination Hunter MVP Benchmark",
        total_cases=total_cases,
        metrics=EvaluationMetrics(
            behavioural_equivalence_pass_rate=round(pass_rate, 4),
            divergence_detection_accuracy=round(detection_accuracy, 4),
            false_positive_rate=round(fpr, 4),
            false_negative_rate=round(fnr, 4),
            mean_verification_latency_ms=round(mean_latency, 2),
        ),
        cases=case_results,
        evaluated_at=datetime.now(timezone.utc).isoformat(),
    )