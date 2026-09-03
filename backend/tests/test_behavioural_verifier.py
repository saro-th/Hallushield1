import pytest
from services.artifact_parser import parse_python_file
from services.behavioural_verifier import verify_unit_behaviour
from models.schemas import SignalStatus, DivergenceType

def test_behavioural_detects_rounding_divergence():
    src_code = "def calculate_total(price, tax):\n    return round(price * (1 + tax), 2)\n"
    gen_code = "def calculate_total(price, tax):\n    return int(price * (1 + tax))\n"

    src_unit = parse_python_file("calc.py", src_code).units[0]
    gen_unit = parse_python_file("calc.py", gen_code).units[0]

    status, results, divs = verify_unit_behaviour(src_code, gen_code, src_unit, gen_unit)

    assert status == SignalStatus.FAIL
    assert len(divs) > 0
    assert any(d.type == DivergenceType.NUMERICAL_MISMATCH for d in divs)

def test_behavioural_verifies_clean_refactoring():
    src_code = "def add(a, b):\n    return a + b\n"
    gen_code = "def add(a, b):\n    temp = a + b\n    return temp\n"

    src_unit = parse_python_file("add.py", src_code).units[0]
    gen_unit = parse_python_file("add.py", gen_code).units[0]

    status, results, divs = verify_unit_behaviour(src_code, gen_code, src_unit, gen_unit)

    assert status == SignalStatus.PASS
    assert len(divs) == 0
    assert all(r.status == SignalStatus.PASS for r in results)

def test_behavioural_detects_exception_divergence():
    src_code = "def safe_divide(a, b):\n    if b == 0:\n        return 0.0\n    return a / b\n"
    gen_code = "def safe_divide(a, b):\n    return a / b\n"

    src_unit = parse_python_file("math_ops.py", src_code).units[0]
    gen_unit = parse_python_file("math_ops.py", gen_code).units[0]

    status, results, divs = verify_unit_behaviour(src_code, gen_code, src_unit, gen_unit)

    assert status == SignalStatus.FAIL
    assert any(d.type == DivergenceType.EXCEPTION_MISMATCH for d in divs)

def test_behavioural_detects_timeout_infinite_loop():
    src_code = "def execute_task(n):\n    return n * 2\n"
    gen_code = "def execute_task(n):\n    while True:\n        pass\n"

    src_unit = parse_python_file("task.py", src_code).units[0]
    gen_unit = parse_python_file("task.py", gen_code).units[0]

    status, results, divs = verify_unit_behaviour(src_code, gen_code, src_unit, gen_unit)

    assert status == SignalStatus.FAIL
    assert any(d.type == DivergenceType.CONTROL_FLOW_MISMATCH for d in divs)
    assert any("timeout" in d.explanation.lower() for d in divs)
