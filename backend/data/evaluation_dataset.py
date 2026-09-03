from models.schemas import ScenarioItem, CodeArtifact, CodeFile, VerificationVerdict, DivergenceType, Language

# backend/data/evaluation_dataset.py (excerpt of canonical categories)

EVALUATION_DATASET: list[ScenarioItem] = [
    # 1. Rounding Truncation (Flagship)
    ScenarioItem(
        scenario_id="num_rounding_001",
        title="Floating-point Rounding vs Truncation",
        category="numerical",
        description="Source uses round(x, 2), generated uses int(x).",
        dataset_type="CURATED",
        source_artifact=CodeArtifact(files=[CodeFile(path="c.py", content="def calc(p, t): return round(p * (1 + t), 2)\n")]),
        generated_artifact=CodeArtifact(files=[CodeFile(path="c.py", content="def calc(p, t): return int(p * (1 + t))\n")]),
        expected_verdict=VerificationVerdict.DIVERGENCE_DETECTED,
        expected_divergence_type=DivergenceType.NUMERICAL_BEHAVIOUR_MISMATCH,
        expected_affected_function="calc"
    ),
    # 2. Relational Boundary Operator Mutation
    ScenarioItem(
        scenario_id="boundary_cond_002",
        title="Greater-Than-Or-Equal Mutation to Greater-Than",
        category="boundary",
        description="Source checks p >= 1000, generated alters condition to p > 1000.",
        dataset_type="CURATED",
        source_artifact=CodeArtifact(files=[CodeFile(path="b.py", content="def discount(p): return p * 0.9 if p >= 1000 else p\n")]),
        generated_artifact=CodeArtifact(files=[CodeFile(path="b.py", content="def discount(p): return p * 0.9 if p > 1000 else p\n")]),
        expected_verdict=VerificationVerdict.DIVERGENCE_DETECTED,
        expected_divergence_type=DivergenceType.BOUNDARY_CONDITION_MISMATCH,
        expected_affected_function="discount"
    ),
    # 3. Clean Intermediate Refactoring (Preserving Semantics)
    ScenarioItem(
        scenario_id="refactor_equiv_003",
        title="Local Variable Extraction and Sub-expression Decomposition",
        category="refactoring",
        description="Source computes inline, generated extracts intermediate variables.",
        dataset_type="CURATED",
        source_artifact=CodeArtifact(files=[CodeFile(path="r.py", content="def total(a, b): return (a + b) * 2\n")]),
        generated_artifact=CodeArtifact(files=[CodeFile(path="r.py", content="def total(a, b):\n    s = a + b\n    return s * 2\n")]),
        expected_verdict=VerificationVerdict.VERIFIED,
        expected_divergence_type=None,
        expected_affected_function=None
    ),
    # 4. Unguarded ZeroDivisionError
    ScenarioItem(
        scenario_id="exception_escape_004",
        title="Unguarded Zero-Division Path",
        category="exception",
        description="Source guards against division by zero; generated omits guard.",
        dataset_type="CURATED",
        source_artifact=CodeArtifact(files=[CodeFile(path="d.py", content="def divide(a, b): return a / b if b != 0 else 0.0\n")]),
        generated_artifact=CodeArtifact(files=[CodeFile(path="d.py", content="def divide(a, b): return a / b\n")]),
        expected_verdict=VerificationVerdict.DIVERGENCE_DETECTED,
        expected_divergence_type=DivergenceType.EXCEPTION_BEHAVIOUR_MISMATCH,
        expected_affected_function="divide"
    ),
    # 5. Missing Function Unit
    ScenarioItem(
        scenario_id="struct_missing_func_005",
        title="Helper Unit Dropped in Generated Artefact",
        category="structural",
        description="Source contains helper and main; generated drops helper.",
        dataset_type="CURATED",
        source_artifact=CodeArtifact(files=[CodeFile(path="h.py", content="def helper(x): return x * 2\ndef main(x): return helper(x)\n")]),
        generated_artifact=CodeArtifact(files=[CodeFile(path="h.py", content="def main(x): return x * 2\n")]),
        expected_verdict=VerificationVerdict.DIVERGENCE_DETECTED,
        expected_divergence_type=DivergenceType.MISSING_FUNCTION,
        expected_affected_function="helper"
    ),
    # Additional 15 real-world scenarios: auth expiry, off-by-one list loops, type conversions,
    # None-handling guards, dictionary key lookups, boolean operator inversions, etc.
]