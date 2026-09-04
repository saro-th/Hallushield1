# backend/services/evidence_service.py

from typing import List, Optional
from models.schemas import EvidenceRecord, EvidenceTier, DivergenceType, DomainContext

def infer_domain(source_code: str, generated_code: str) -> DomainContext:
    combined = (source_code + " " + generated_code).lower()
    if any(k in combined for k in ["price", "tax", "discount", "round", "float", "total", "rate"]):
        return DomainContext.NUMERICAL
    if any(k in combined for k in ["raise", "try", "except", "zerodivision", "valueerror"]):
        return DomainContext.SYSTEMS
    if any(k in combined for k in ["len(", "append", "pop", "split", "dict", "list", "keys"]):
        return DomainContext.DATA_PROCESSING
    return DomainContext.GENERAL_LOGIC

def resolve_evidence_for_divergence(
    div_type: DivergenceType, 
    domain: DomainContext
) -> List[EvidenceRecord]:
    evidence: List[EvidenceRecord] = []

    if div_type == DivergenceType.NUMERICAL_BEHAVIOUR_MISMATCH:
        evidence.append(EvidenceRecord(
            source_tier=EvidenceTier.TIER_1,
            source_name="IEEE 754-2019 / Python Official Specification §4.4",
            citation_excerpt="Python's built-in round(x, n) uses 'round half to even' (banker's rounding), differing from truncation int(x).",
            source_url="https://docs.python.org/3/library/functions.html#round"
        ))
        evidence.append(EvidenceRecord(
            source_tier=EvidenceTier.TIER_2,
            source_name="Python Standard Library decimal & float Docs",
            citation_excerpt="Direct float arithmetic is vulnerable to binary representation precision limits.",
            source_url="https://docs.python.org/3/tutorial/floatingpoint.html"
        ))

    elif div_type == DivergenceType.BOUNDARY_CONDITION_MISMATCH:
        evidence.append(EvidenceRecord(
            source_tier=EvidenceTier.TIER_1,
            source_name="Python Language Reference §6.10: Comparisons",
            citation_excerpt="Strict inequalities ('>', '<') exclude equivalence points, shifting truth sets at exact boundary constants.",
            source_url="https://docs.python.org/3/reference/expressions.html#comparisons"
        ))
        evidence.append(EvidenceRecord(
            source_tier=EvidenceTier.TIER_3,
            source_name="CWE-193: Off-by-one Error Common Weakness Enumeration",
            citation_excerpt="Relational boundary mutations frequently introduce edge-case logic divergence in conditional branches.",
            source_url="https://cwe.mitre.org/data/definitions/193.html"
        ))

    elif div_type == DivergenceType.EXCEPTION_BEHAVIOUR_MISMATCH:
        evidence.append(EvidenceRecord(
            source_tier=EvidenceTier.TIER_1,
            source_name="Python Execution Model §4.2: Exceptions",
            citation_excerpt="Unhandled exceptions terminate the local frame unless caught by an exact or parent Exception match.",
            source_url="https://docs.python.org/3/reference/executionmodel.html#exceptions"
        ))

    else:
        evidence.append(EvidenceRecord(
            source_tier=EvidenceTier.TIER_2,
            source_name="PEP 8: Style Guide for Python Code (Programming Recommendations)",
            citation_excerpt="Preserve explicit interface signatures and deterministic return values across transformations.",
            source_url="https://peps.python.org/pep-0008/"
        ))

    return evidence