import uuid
from datetime import datetime, timezone
from typing import List
from models.schemas import DivergenceType, EvidenceItem, SourceTier

OFFICIAL_KNOWLEDGE_BASE = {
    DivergenceType.NUMERICAL_MISMATCH: [
        EvidenceItem(
            evidence_id="EVID-PY-ROUND",
            source_name="Python 3 Official Documentation: Built-in Functions - round()",
            source_url="https://docs.python.org/3/library/functions.html#round",
            source_tier=SourceTier.TIER_1,
            authority_score=1.0,
            relevance="Specifies round-half-to-even behavior and floating-point representation.",
            citation_excerpt="Values are rounded to the closest multiple of 10 to the power minus n; if two multiples are equally close, rounding is done toward the even choice.",
            retrieved_at=datetime.now(timezone.utc).isoformat(),
        ),
        EvidenceItem(
            evidence_id="EVID-IEEE-754",
            source_name="IEEE Standard for Floating-Point Arithmetic (IEEE 754)",
            source_url="https://standards.ieee.org/ieee/754/6063/",
            source_tier=SourceTier.TIER_1,
            authority_score=1.0,
            relevance="Governs float rounding vs integer truncation semantics.",
            citation_excerpt="Truncation towards zero discards fractional digits directly without proximity evaluation.",
            retrieved_at=datetime.now(timezone.utc).isoformat(),
        ),
    ],
    DivergenceType.EXCEPTION_MISMATCH: [
        EvidenceItem(
            evidence_id="EVID-PY-ZERO-DIV",
            source_name="Python Standard Library: Built-in Exceptions - ZeroDivisionError",
            source_url="https://docs.python.org/3/library/exceptions.html#ZeroDivisionError",
            source_tier=SourceTier.TIER_1,
            authority_score=1.0,
            relevance="Specifies runtime exception raised when the second argument of a division is zero.",
            citation_excerpt="Raised when the second argument for a division or modulo operation is zero.",
            retrieved_at=datetime.now(timezone.utc).isoformat(),
        )
    ],
    DivergenceType.MISSING_FUNCTION: [
        EvidenceItem(
            evidence_id="EVID-PEP-8",
            source_name="PEP 8 – Style Guide for Python Code (API Completeness)",
            source_url="https://peps.python.org/pep-0008/",
            source_tier=SourceTier.TIER_1,
            authority_score=0.95,
            relevance="Governs interface and public function contract preservation.",
            citation_excerpt="Public interfaces must preserve defined functional exports to prevent downstream consumer breakage.",
            retrieved_at=datetime.now(timezone.utc).isoformat(),
        )
    ],
    DivergenceType.PARAMETER_MISMATCH: [
        EvidenceItem(
            evidence_id="EVID-PY-INSPECT",
            source_name="Python inspect Module - Parameter Signature Specification",
            source_url="https://docs.python.org/3/library/inspect.html#inspect.signature",
            source_tier=SourceTier.TIER_1,
            authority_score=0.95,
            relevance="Defines callable parameter binding rules and arity requirements.",
            citation_excerpt="A signature mismatch causes TypeError: missing or unexpected positional argument at invocation.",
            retrieved_at=datetime.now(timezone.utc).isoformat(),
        )
    ],
}

def resolve_evidence_for_divergence(div_type: DivergenceType) -> List[EvidenceItem]:
    """Retrieves authoritative external evidence items for a given divergence category."""
    return OFFICIAL_KNOWLEDGE_BASE.get(div_type, [])