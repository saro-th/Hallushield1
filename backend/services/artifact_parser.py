import ast
from typing import List, Optional
from pydantic import BaseModel

class ParsedUnit(BaseModel):
    unit_id: str
    unit_type: str = "function"
    name: str
    file_path: str
    start_line: int
    end_line: int
    args: List[str]
    has_return: bool
    source_code: str

class ParseResult(BaseModel):
    file_path: str
    is_valid: bool
    syntax_error: Optional[str] = None
    units: List[ParsedUnit] = []

class CodeVisitor(ast.NodeVisitor):
    def __init__(self, file_path: str, lines: List[str]):
        self.file_path = file_path
        self.lines = lines
        self.units: List[ParsedUnit] = []
        self.counter = 0

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self.counter += 1
        unit_id = f"FUNC_{self.counter:03d}"
        
        args = [arg.arg for arg in node.args.args]
        
        has_return = any(
            isinstance(sub, ast.Return) and sub.value is not None
            for sub in ast.walk(node)
        )

        start_line = node.lineno
        end_line = getattr(node, "end_lineno", node.lineno)
        source_code = "\n".join(self.lines[start_line - 1 : end_line])

        self.units.append(
            ParsedUnit(
                unit_id=unit_id,
                unit_type="function",
                name=node.name,
                file_path=self.file_path,
                start_line=start_line,
                end_line=end_line,
                args=args,
                has_return=has_return,
                source_code=source_code,
            )
        )
        self.generic_visit(node)

def parse_python_file(file_path: str, content: str) -> ParseResult:
    """Parses Python source code into structural units using the standard AST library."""
    try:
        tree = ast.parse(content, filename=file_path)
    except SyntaxError as e:
        return ParseResult(
            file_path=file_path,
            is_valid=False,
            syntax_error=f"SyntaxError at line {e.lineno}: {e.msg}",
            units=[],
        )

    lines = content.splitlines()
    visitor = CodeVisitor(file_path=file_path, lines=lines)
    visitor.visit(tree)
    return ParseResult(file_path=file_path, is_valid=True, units=visitor.units)