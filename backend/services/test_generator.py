import ast
import itertools
from dataclasses import dataclass
from typing import List, Dict, Any
from services.artifact_parser import ParsedUnit

@dataclass
class GeneratedTestCase:
    test_id: str
    inputs: Dict[str, Any]

class BoundaryVisitor(ast.NodeVisitor):
    def __init__(self):
        self.constants = set()
        self.has_division = False

    def visit_Compare(self, node):
        for comparator in node.comparators:
            if isinstance(comparator, ast.Constant) and isinstance(comparator.value, (int, float)):
                self.constants.add(comparator.value)
        if isinstance(node.left, ast.Constant) and isinstance(node.left.value, (int, float)):
            self.constants.add(node.left.value)
        self.generic_visit(node)

    def visit_BinOp(self, node):
        if isinstance(node.op, (ast.Div, ast.FloorDiv, ast.Mod)):
            self.has_division = True
        self.generic_visit(node)

def extract_targeted_test_values(param_name: str, unit: ParsedUnit) -> List[Any]:
    """Inspects AST of function body to pull exact comparison boundary vectors."""
    values = [0, 1, -1]
    
    code_text = getattr(unit, "raw_code", None) or getattr(unit, "source_code", None) or ""
    if code_text:
        try:
            tree = ast.parse(code_text)
            visitor = BoundaryVisitor()
            visitor.visit(tree)

            for c in visitor.constants:
                values.extend([c, c - 1, c + 1])
                if isinstance(c, (int, float)) and c != 0:
                    values.extend([round(c * 0.9, 2), round(c * 1.1, 2)])

            if visitor.has_division:
                values.extend([0, 0.0])
        except Exception:
            pass

    # Generic boundary samples for common parameter naming patterns
    p_lower = param_name.lower()
    if any(k in p_lower for k in ("price", "cost", "total", "amount", "val", "num", "tax", "rate")):
        values.extend([0.0, 100.0, 100.5, 0.18, 1000, 999, 1001])
    elif any(k in p_lower for k in ("name", "str", "text", "msg", "s")):
        values.extend(["", "test", "a" * 50])
    elif any(k in p_lower for k in ("items", "arr", "lst", "list", "data")):
        values.extend([[], [1], [1, 2, 3]])

    # Deduplicate while preserving deterministic order
    seen = set()
    deduped = []
    for v in values:
        try:
            marker = (type(v).__name__, v)
            if marker not in seen:
                seen.add(marker)
                deduped.append(v)
        except TypeError:
            deduped.append(v)
            
    return deduped

def generate_test_matrix_for_unit(unit: ParsedUnit) -> List[GeneratedTestCase]:
    """
    Generates a deterministic matrix of test cases for a parsed Python unit.
    """
    params = getattr(unit, "args", None) or getattr(unit, "parameters", [])
    if not params:
        return [GeneratedTestCase(test_id=f"TC-{unit.name}-001", inputs={})]

    param_pools: Dict[str, List[Any]] = {}
    for p in params:
        param_pools[p] = extract_targeted_test_values(p, unit)

    test_cases: List[GeneratedTestCase] = []

    # If single parameter, test all extracted boundaries directly
    if len(params) == 1:
        p = params[0]
        for idx, val in enumerate(param_pools[p], 1):
            test_cases.append(
                GeneratedTestCase(
                    test_id=f"TC-{unit.name}-{idx:03d}",
                    inputs={p: val}
                )
            )
        return test_cases

    # For multiple parameters, form pairwise combinations capped to avoid combinatorial explosion
    keys = list(param_pools.keys())
    pool_lists = [param_pools[k][:4] for k in keys]

    combos = list(itertools.product(*pool_lists))
    for idx, combo in enumerate(combos[:8], 1):
        input_dict = {k: combo[i] for i, k in enumerate(keys)}
        test_cases.append(
            GeneratedTestCase(
                test_id=f"TC-{unit.name}-{idx:03d}",
                inputs=input_dict
            )
        )

    return test_cases