import uuid
import math
from typing import List, Tuple, Any
from services.artifact_parser import ParsedUnit
from services.test_generator import generate_test_matrix_for_unit
from services.execution_service import execute_sandboxed_function
from models.schemas import (
    TestCaseResult,
    DivergenceDetail,
    DivergenceType,
    SignalStatus,
)

def outputs_are_equivalent(a: Any, b: Any) -> bool:
    """Verifies output equivalence with exact type parity and float delta precision."""
    if type(a) is not type(b):
        return False
    if isinstance(a, float) and isinstance(b, float):
        return math.isclose(a, b, rel_tol=1e-7, abs_tol=1e-7)
    return a == b

def verify_unit_behaviour(
    source_code: str,
    generated_code: str,
    source_unit: ParsedUnit,
    generated_unit: ParsedUnit,
) -> Tuple[SignalStatus, List[TestCaseResult], List[DivergenceDetail]]:
    """
    Executes differential testing between source and generated implementations
    across synthesized test cases.
    """
    test_cases = generate_test_matrix_for_unit(source_unit)
    test_results: List[TestCaseResult] = []
    divergences: List[DivergenceDetail] = []

    for tc in test_cases:
        src_res = execute_sandboxed_function(source_code, source_unit.name, tc.inputs)
        gen_res = execute_sandboxed_function(generated_code, generated_unit.name, tc.inputs)

        # 1. TOP PRIORITY: Sandbox Timeout / Infinite Loop
        if gen_res.timed_out or (gen_res.error and "timed out" in gen_res.error.lower()):
            test_res = TestCaseResult(
                test_id=tc.test_id,
                input_data=tc.inputs,
                expected_output=src_res.output if src_res.success else "Completion",
                actual_output=None,
                status=SignalStatus.FAIL,
                error="Execution timed out (exceeded 2.0s sandbox boundary)",
            )
            test_results.append(test_res)
            divergences.append(
                DivergenceDetail(
                    divergence_id=f"DIV-{uuid.uuid4().hex[:6].upper()}",
                    type=DivergenceType.CONTROL_FLOW_MISMATCH,
                    file=generated_unit.file_path,
                    function=generated_unit.name,
                    location=f"{generated_unit.file_path}:{generated_unit.start_line}-{generated_unit.end_line}",
                    test_case=test_res,
                    explanation="Generated code triggered an execution timeout (possible infinite loop or blocking call).",
                    expected_behaviour="Execution completes within 2.0s limit",
                    actual_behaviour="Process terminated by timeout guard",
                )
            )
            # Break early so subsequent test cases do not stall the sandbox repeatedly
            break

        # 2. Output Equivalence Check (both succeeded)
        if src_res.success and gen_res.success:
            if outputs_are_equivalent(src_res.output, gen_res.output):
                test_results.append(
                    TestCaseResult(
                        test_id=tc.test_id,
                        input_data=tc.inputs,
                        expected_output=src_res.output,
                        actual_output=gen_res.output,
                        status=SignalStatus.PASS,
                    )
                )
            else:
                div_type = DivergenceType.BEHAVIOURAL_MISMATCH
                explanation = "Output mismatch for identical input parameters."
                
                if isinstance(src_res.output, float) and isinstance(gen_res.output, int):
                    div_type = DivergenceType.NUMERICAL_MISMATCH
                    explanation = "Generated implementation truncated floating-point precision to integer."
                elif type(src_res.output) is not type(gen_res.output):
                    div_type = DivergenceType.TYPE_MISMATCH
                    explanation = f"Return type changed from {type(src_res.output).__name__} to {type(gen_res.output).__name__}."

                test_res = TestCaseResult(
                    test_id=tc.test_id,
                    input_data=tc.inputs,
                    expected_output=src_res.output,
                    actual_output=gen_res.output,
                    status=SignalStatus.FAIL,
                )
                test_results.append(test_res)

                divergences.append(
                    DivergenceDetail(
                        divergence_id=f"DIV-{uuid.uuid4().hex[:6].upper()}",
                        type=div_type,
                        file=generated_unit.file_path,
                        function=generated_unit.name,
                        location=f"{generated_unit.file_path}:{generated_unit.start_line}-{generated_unit.end_line}",
                        test_case=test_res,
                        explanation=explanation,
                        expected_behaviour=f"Output {src_res.output!r}",
                        actual_behaviour=f"Output {gen_res.output!r}",
                    )
                )

        # 3. Exception Divergence (source succeeded, generated raised exception)
        elif src_res.success and not gen_res.success:
            test_res = TestCaseResult(
                test_id=tc.test_id,
                input_data=tc.inputs,
                expected_output=src_res.output,
                actual_output=None,
                status=SignalStatus.FAIL,
                error=gen_res.error,
            )
            test_results.append(test_res)
            divergences.append(
                DivergenceDetail(
                    divergence_id=f"DIV-{uuid.uuid4().hex[:6].upper()}",
                    type=DivergenceType.EXCEPTION_MISMATCH,
                    file=generated_unit.file_path,
                    function=generated_unit.name,
                    location=f"{generated_unit.file_path}:{generated_unit.start_line}-{generated_unit.end_line}",
                    test_case=test_res,
                    explanation=f"Generated code raised {gen_res.error_type or 'Exception'}: {gen_res.error}",
                    expected_behaviour=f"Expected successful return: {src_res.output!r}",
                    actual_behaviour=f"Raised {gen_res.error_type}: {gen_res.error}",
                )
            )

        elif not src_res.success and gen_res.success:
            test_results.append(
                TestCaseResult(
                    test_id=tc.test_id,
                    input_data=tc.inputs,
                    expected_output=f"Error: {src_res.error}",
                    actual_output=gen_res.output,
                    status=SignalStatus.WARNING,
                )
            )

    signal_status = SignalStatus.FAIL if divergences else SignalStatus.PASS
    return signal_status, test_results, divergences