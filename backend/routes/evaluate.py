from fastapi import APIRouter, status, Response
from models.schemas import EvaluationResponse
from services.evaluation_service import run_evaluation_benchmark

router = APIRouter(prefix="/api", tags=["evaluation"])

@router.get(
    "/evaluate",
    response_model=EvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Run benchmark suite and compute empirical verification metrics",
)
async def evaluate_dataset() -> EvaluationResponse:
    return run_evaluation_benchmark()

@router.get(
    "/evaluate/export",
    status_code=status.HTTP_200_OK,
    summary="Export reproducible benchmark evaluation audit report in Markdown format",
)
async def export_evaluation_report() -> Response:
    eval_res = run_evaluation_benchmark()
    m = eval_res.metrics

    lines = [
        f"# HALLUCINATION HUNTER — EVALUATION BENCHMARK AUDIT REPORT",
        f"**Generated:** {eval_res.evaluated_at}",
        f"**Dataset:** {eval_res.dataset_name} ({eval_res.total_cases} test cases)",
        f"",
        f"## Empirical Impact Metrics",
        f"| Metric | Measured Value | Standard Target |",
        f"| :--- | :--- | :--- |",
        f"| Divergence Detection Accuracy | **{m.divergence_detection_accuracy * 100:.1f}%** | > 85.0% |",
        f"| Behavioural Equivalence Pass Rate | **{m.behavioural_equivalence_pass_rate * 100:.1f}%** | 100.0% |",
        f"| False Positive Rate | **{m.false_positive_rate * 100:.1f}%** | < 5.0% |",
        f"| False Negative Rate | **{m.false_negative_rate * 100:.1f}%** | < 5.0% |",
        f"| Mean Verification Latency | **{m.mean_verification_latency_ms:.1f} ms** | < 1000 ms |",
        f"",
        f"## Case-by-Case Breakdown",
    ]

    for c in eval_res.cases:
        status_icon = "PASS" if c.correct else "FAIL"
        lines.append(f"### [{status_icon}] {c.scenario_id}: {c.title}")
        lines.append(f"- **Category:** {c.category}")
        lines.append(f"- **Expected Verdict:** `{c.expected_verdict}`")
        lines.append(f"- **Actual Verdict:** `{c.actual_verdict}`")
        lines.append(f"- **Divergences Found:** {c.actual_divergences_count}")
        lines.append(f"- **Execution Latency:** {c.latency_ms} ms")
        lines.append("")

    report_content = "\n".join(lines)
    return Response(
        content=report_content,
        media_type="text/markdown",
        headers={"Content-Disposition": "attachment; filename=hallucination_hunter_benchmark_audit.md"},
    )