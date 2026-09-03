from typing import List, Tuple
from services.artifact_parser import ParsedUnit
from models.schemas import MatchedUnit

def match_code_units(
    source_units: List[ParsedUnit],
    generated_units: List[ParsedUnit]
) -> Tuple[List[MatchedUnit], List[ParsedUnit], List[ParsedUnit]]:
    """
    Pairs functions between source and generated artefacts by name.
    Returns: (matched_units, missing_in_generated, extra_in_generated)
    """
    matched: List[MatchedUnit] = []
    gen_by_name = {u.name: u for u in generated_units}
    source_names_seen = set()

    for s_unit in source_units:
        source_names_seen.add(s_unit.name)
        g_unit = gen_by_name.get(s_unit.name)
        if g_unit:
            matched.append(
                MatchedUnit(
                    source_unit_id=s_unit.unit_id,
                    generated_unit_id=g_unit.unit_id,
                    name=s_unit.name,
                    unit_type=s_unit.unit_type,
                    source_location=f"{s_unit.file_path}:{s_unit.start_line}-{s_unit.end_line}",
                    generated_location=f"{g_unit.file_path}:{g_unit.start_line}-{g_unit.end_line}",
                )
            )
        else:
            matched.append(
                MatchedUnit(
                    source_unit_id=s_unit.unit_id,
                    generated_unit_id=None,
                    name=s_unit.name,
                    unit_type=s_unit.unit_type,
                    source_location=f"{s_unit.file_path}:{s_unit.start_line}-{s_unit.end_line}",
                    generated_location=None,
                )
            )

    missing_in_generated = [u for u in source_units if u.name not in gen_by_name]
    extra_in_generated = [u for u in generated_units if u.name not in source_names_seen]

    return matched, missing_in_generated, extra_in_generated