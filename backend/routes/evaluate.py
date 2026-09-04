# backend/routes/evaluate.py

import time
from typing import Any, Dict
from fastapi import APIRouter
from fastapi.responses import Response

from models.schemas import VerifyRequest
from routes.scenarios import BENCHMARK_SCENARIOS
from services.verification_service import run_verification_pipeline

router = APIRouter(tags=["evaluation"])


@router.get("/api/evaluate")
@router.get("/evaluate")
async def evaluate_benchmarks() -> Dict[str, Any]:
    results = []
    divergence_count = 0
    verified_count = 0
    start_time = time.time()

    for sc in BENCHMARK_SCENARIOS:
        # Pass dictionary payloads directly into VerifyRequest
        req = VerifyRequest(
            source_artifact={
                "language": "python",
                "files": [{"path": "main.py", "content": sc["source_code"]}],
            },
            generated_artifact={
                "language": "python",
                "files": [{"path": "main.py", "content": sc["generated_code"]}],
            },
        )

        v_res = run_verification_pipeline(req)
        actual_verdict = (
            v_res.verdict.value if hasattr(v_res.verdict, "value") else str(v_res.verdict)
        )
        expected_verdict = sc["expected_verdict"]
        is_match = actual_verdict == expected_verdict

        if "DIVERGENCE" in actual_verdict:
            divergence_count += 1
        elif "VERIFIED" in actual_verdict:
            verified_count += 1

        results.append({
            "scenario_id": sc["id"],
            "name": sc["name"],
            "category": sc.get("category", "GENERAL"),
            "expected_verdict": expected_verdict,
            "actual_verdict": actual_verdict,
            "matched": is_match,
        })

    total = len(BENCHMARK_SCENARIOS) if BENCHMARK_SCENARIOS else 1
    accuracy = sum(1 for r in results if r["matched"]) / total
    mean_latency = ((time.time() - start_time) / total) * 1000

    return {
        "total_scenarios": len(BENCHMARK_SCENARIOS),
        "divergence_count": divergence_count,
        "verified_count": verified_count,
        "accuracy_score": accuracy,
        "mean_latency_ms": mean_latency,
        "scenario_results": results,
    }


@router.get("/api/evaluate/export")
@router.get("/evaluate/export")
async def export_benchmark_report():
    eval_data = await evaluate_benchmarks()
    accuracy_pct = eval_data["accuracy_score"] * 100

    md_report = f"""# Hallucination Hunter - Benchmark Evaluation Report
- **Accuracy Score**: {accuracy_pct:.1f}%
- **Total Scenarios Evaluated**: {eval_data['total_scenarios']}
- **Caught Divergences**: {eval_data['divergence_count']}
- **Verified Equivalence Preserved**: {eval_data['verified_count']}
- **Mean Subprocess Sandbox Latency**: {eval_data['mean_latency_ms']:.1f}ms

## Scenario Execution Breakdown
| Scenario Name | Category | Expected Verdict | Actual Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
"""
    for r in eval_data["scenario_results"]:
        status = "MATCH (PASS)" if r["matched"] else "MISMATCH (FAIL)"
        md_report += (
            f"| {r['name']} | `{r['category']}` | `{r['expected_verdict']}` | `{r['actual_verdict']}` | {status} |\n"
        )

    return Response(content=md_report, media_type="text/markdown")