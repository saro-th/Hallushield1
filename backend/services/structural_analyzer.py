import uuid
from typing import List, Tuple
from services.artifact_parser import ParsedUnit, ParseResult
from services.unit_matcher import match_code_units
from models.schemas import (
    DivergenceDetail,
    DivergenceType,
    SignalStatus,
    MatchedUnit,
)

def analyze_structure(
    source_parse_results: List[ParseResult],
    generated_parse_results: List[ParseResult],
) -> Tuple[SignalStatus, List[MatchedUnit], List[DivergenceDetail]]:
    """
    Executes AST structural analysis:
    - Flags syntax failures
    - Pinpoints missing functions
    - Detects parameter drift
    """
    divergences: List[DivergenceDetail] = []
    
    # 1. Flag syntax errors
    for res in generated_parse_results:
        if not res.is_valid:
            divergences.append(
                DivergenceDetail(
                    divergence_id=f"DIV-{uuid.uuid4().hex[:6].upper()}",
                    type=DivergenceType.LOGIC_MISMATCH,
                    file=res.file_path,
                    function="<module>",
                    explanation=f"Generated code failed syntax parsing: {res.syntax_error}",
                    expected_behaviour="Syntactically valid Python code",
                    actual_behaviour=res.syntax_error or "SyntaxError",
                )
            )
            return SignalStatus.FAIL, [], divergences

    # 2. Extract and pair units
    source_units = [u for res in source_parse_results for u in res.units]
    generated_units = [u for res in generated_parse_results for u in res.units]

    matched_units, missing_units, _ = match_code_units(source_units, generated_units)
    gen_unit_map = {u.name: u for u in generated_units}

    # 3. Detect missing functions
    for missing in missing_units:
        divergences.append(
            DivergenceDetail(
                divergence_id=f"DIV-{uuid.uuid4().hex[:6].upper()}",
                type=DivergenceType.MISSING_FUNCTION,
                file=missing.file_path,
                function=missing.name,
                location=f"{missing.file_path}:{missing.start_line}-{missing.end_line}",
                explanation=f"Function '{missing.name}' was present in source but missing from generated artefact.",
                expected_behaviour=f"Function '{missing.name}' declared with parameters {missing.args}",
                actual_behaviour="Function declaration is absent",
            )
        )

    # 4. Check matched functions for parameter signature drift
    for s_unit in source_units:
        g_unit = gen_unit_map.get(s_unit.name)
        if not g_unit:
            continue

        if s_unit.args != g_unit.args:
            divergences.append(
                DivergenceDetail(
                    divergence_id=f"DIV-{uuid.uuid4().hex[:6].upper()}",
                    type=DivergenceType.PARAMETER_MISMATCH,
                    file=g_unit.file_path,
                    function=g_unit.name,
                    location=f"{g_unit.file_path}:{g_unit.start_line}-{g_unit.end_line}",
                    explanation=f"Parameter signature changed from {s_unit.args} to {g_unit.args}.",
                    expected_behaviour=f"Arguments: {s_unit.args}",
                    actual_behaviour=f"Arguments: {g_unit.args}",
                )
            )

    if any(d.type in (DivergenceType.MISSING_FUNCTION, DivergenceType.PARAMETER_MISMATCH) for d in divergences):
        status = SignalStatus.FAIL
    elif divergences:
        status = SignalStatus.WARNING
    else:
        status = SignalStatus.PASS

    return status, matched_units, divergences