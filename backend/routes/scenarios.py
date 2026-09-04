# backend/routes/scenarios.py

from typing import Any, Dict, List
from fastapi import APIRouter

router = APIRouter(tags=["scenarios"])

BENCHMARK_SCENARIOS: List[Dict[str, Any]] = [
    {
        "id": "SC-01",
        "name": "Numerical Rounding Truncation",
        "category": "NUMERICAL",
        "description": "Floating-point tax calculation where IEEE-754 banker's rounding is altered to integer truncation.",
        "expected_verdict": "DIVERGENCE_DETECTED",
        "source_code": (
            "def calculate_tax(amount: float, rate: float) -> float:\n"
            "    \"\"\"Calculates total tax using IEEE-754 banker's rounding.\"\"\"\n"
            "    return round(amount * (1.0 + rate), 2)\n"
        ),
        "generated_code": (
            "def calculate_tax(amount: float, rate: float) -> float:\n"
            "    \"\"\"Optimized tax calculation using truncation.\"\"\"\n"
            "    return float(int(amount * (1.0 + rate) * 100) / 100)\n"
        ),
    },
    {
        "id": "SC-02",
        "name": "Relational Boundary Mutation",
        "category": "BOUNDARY",
        "description": "VIP tier access threshold mutated from greater-than-or-equal (>=) to strict inequality (>).",
        "expected_verdict": "DIVERGENCE_DETECTED",
        "source_code": (
            "def grant_tier_access(score: int, is_verified: bool) -> str:\n"
            "    if score >= 100 and is_verified:\n"
            "        return 'PLATINUM'\n"
            "    elif score >= 50:\n"
            "        return 'GOLD'\n"
            "    return 'STANDARD'\n"
        ),
        "generated_code": (
            "def grant_tier_access(score: int, is_verified: bool) -> str:\n"
            "    # Boundary error: score == 100 falls through to GOLD\n"
            "    if score > 100 and is_verified:\n"
            "        return 'PLATINUM'\n"
            "    elif score >= 50:\n"
            "        return 'GOLD'\n"
            "    return 'STANDARD'\n"
        ),
    },
    {
        "id": "SC-03",
        "name": "Zero-Crossing Exception Drift",
        "category": "EXCEPTION",
        "description": "Defensive zero-division branch omitted in candidate code, causing unexpected runtime exception.",
        "expected_verdict": "DIVERGENCE_DETECTED",
        "source_code": (
            "def calculate_ratio(dividend: float, divisor: float) -> float:\n"
            "    if divisor == 0.0:\n"
            "        return 0.0\n"
            "    return round(dividend / divisor, 4)\n"
        ),
        "generated_code": (
            "def calculate_ratio(dividend: float, divisor: float) -> float:\n"
            "    # LLM dropped zero division check\n"
            "    return round(dividend / divisor, 4)\n"
        ),
    },
    {
        "id": "SC-04",
        "name": "Clean List Comprehension Refactor",
        "category": "REFACTOR",
        "description": "Imperative loop converted to functional list comprehension; preserving exact behavioral equivalence.",
        "expected_verdict": "VERIFIED",
        "source_code": (
            "def filter_active_ids(records: list) -> list:\n"
            "    valid = []\n"
            "    for r in records:\n"
            "        if r is not None and len(str(r)) > 0:\n"
            "            valid.append(str(r).strip())\n"
            "    return valid\n"
        ),
        "generated_code": (
            "def filter_active_ids(records: list) -> list:\n"
            "    return [str(r).strip() for r in records if r is not None and len(str(r)) > 0]\n"
        ),
    },
    {
        "id": "SC-05",
        "name": "Overtime Payroll Threshold Shift",
        "category": "SYSTEMS",
        "description": "Standard 40-hour overtime rate calculation shifted to strict inequality at the boundary value.",
        "expected_verdict": "DIVERGENCE_DETECTED",
        "source_code": (
            "def compute_payroll(hours: float, rate: float) -> float:\n"
            "    if hours <= 40.0:\n"
            "        return round(hours * rate, 2)\n"
            "    overtime = hours - 40.0\n"
            "    return round((40.0 * rate) + (overtime * rate * 1.5), 2)\n"
        ),
        "generated_code": (
            "def compute_payroll(hours: float, rate: float) -> float:\n"
            "    # Mutated boundary condition\n"
            "    if hours < 40.0:\n"
            "        return round(hours * rate, 2)\n"
            "    overtime = hours - 40.0\n"
            "    return round((40.0 * rate) + (overtime * rate * 1.5), 2)\n"
        ),
    },
]


@router.get("/api/scenarios")
@router.get("/scenarios")
async def list_scenarios() -> Dict[str, Any]:
    return {
        "total_scenarios": len(BENCHMARK_SCENARIOS),
        "scenarios": BENCHMARK_SCENARIOS,
    }