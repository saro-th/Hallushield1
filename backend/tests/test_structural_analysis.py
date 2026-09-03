import pytest
from services.artifact_parser import parse_python_file
from services.structural_analyzer import analyze_structure
from models.schemas import SignalStatus, DivergenceType

def test_parse_valid_function():
    code = "def calculate_total(price, tax):\n    return round(price * (1 + tax), 2)\n"
    res = parse_python_file("calc.py", code)
    assert res.is_valid is True
    assert len(res.units) == 1
    assert res.units[0].name == "calculate_total"
    assert res.units[0].args == ["price", "tax"]
    assert res.units[0].has_return is True

def test_structural_detects_missing_function():
    src_code = "def foo(): pass\ndef bar(): pass\n"
    gen_code = "def foo(): pass\n"
    
    src_res = parse_python_file("src.py", src_code)
    gen_res = parse_python_file("gen.py", gen_code)
    
    status, matched, divs = analyze_structure([src_res], [gen_res])
    assert status == SignalStatus.FAIL
    assert any(d.type == DivergenceType.MISSING_FUNCTION and d.function == "bar" for d in divs)

def test_structural_detects_parameter_drift():
    src_code = "def add(a, b): return a + b\n"
    gen_code = "def add(a, b, c): return a + b + c\n"
    
    src_res = parse_python_file("src.py", src_code)
    gen_res = parse_python_file("gen.py", gen_code)
    
    status, matched, divs = analyze_structure([src_res], [gen_res])
    assert status == SignalStatus.FAIL
    assert any(d.type == DivergenceType.PARAMETER_MISMATCH for d in divs)