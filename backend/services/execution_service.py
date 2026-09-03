import json
import os
import subprocess
import sys
import tempfile
from typing import Any, Dict, Optional
from pydantic import BaseModel

class ExecutionResult(BaseModel):
    success: bool
    output: Any = None
    error: Optional[str] = None
    error_type: Optional[str] = None
    timed_out: bool = False

HARNESS_TEMPLATE = """
import json
import sys

{code}

if __name__ == "__main__":
    try:
        raw_inputs = sys.stdin.read()
        kwargs = json.loads(raw_inputs) if raw_inputs else {{}}
        result = {func_name}(**kwargs)
        print("__RESULT_START__")
        print(json.dumps({{"status": "ok", "value": result}}))
        print("__RESULT_END__")
    except Exception as e:
        print("__RESULT_START__")
        print(json.dumps({{"status": "error", "type": type(e).__name__, "message": str(e)}}))
        print("__RESULT_END__")
"""

def execute_sandboxed_function(
    code: str,
    func_name: str,
    inputs: Dict[str, Any],
    timeout_seconds: float = 2.0
) -> ExecutionResult:
    """
    Executes a function call inside an isolated temporary subprocess with:
    - Dedicated clean directory
    - Timeout protection against infinite loops
    - Intercepted stdio streams
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        script_path = os.path.join(temp_dir, "runner.py")
        harness = HARNESS_TEMPLATE.format(code=code, func_name=func_name)

        with open(script_path, "w", encoding="utf-8") as f:
            f.write(harness)

        try:
            proc = subprocess.run(
                [sys.executable, script_path],
                input=json.dumps(inputs),
                text=True,
                capture_output=True,
                timeout=timeout_seconds,
                cwd=temp_dir,
            )
        except subprocess.TimeoutExpired:
            return ExecutionResult(success=False, error="Execution timed out", timed_out=True)

        if proc.returncode != 0 and "__RESULT_START__" not in proc.stdout:
            return ExecutionResult(
                success=False,
                error=proc.stderr.strip() or f"Process exited with code {proc.returncode}",
                error_type="ProcessCrash",
            )

        stdout = proc.stdout
        if "__RESULT_START__" in stdout and "__RESULT_END__" in stdout:
            payload = stdout.split("__RESULT_START__")[1].split("__RESULT_END__")[0].strip()
            try:
                data = json.loads(payload)
                if data["status"] == "ok":
                    return ExecutionResult(success=True, output=data["value"])
                else:
                    return ExecutionResult(
                        success=False,
                        error=data["message"],
                        error_type=data["type"]
                    )
            except json.JSONDecodeError:
                return ExecutionResult(success=False, error="Failed to decode runner payload")

        return ExecutionResult(success=False, error=proc.stderr or "No recognizable output produced")