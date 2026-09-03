import hashlib
from typing import List
from models.schemas import CodeFile

def calculate_artifact_hash(files: List[CodeFile]) -> str:
    """Computes a deterministic SHA-256 hash across sorted artifact files."""
    hasher = hashlib.sha256()
    sorted_files = sorted(files, key=lambda f: f.path)
    for f in sorted_files:
        hasher.update(f.path.encode("utf-8"))
        hasher.update(b"\x00")
        hasher.update(f.content.encode("utf-8"))
        hasher.update(b"\x00")
    return hasher.hexdigest()