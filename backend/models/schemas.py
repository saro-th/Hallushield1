from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# --- Enums ---

class Language(str, Enum):
    PYTHON = "python"

class VerificationVerdict(str, Enum):
    VERIFIED = "VERIFIED"
    DIVERGENCE_DETECTED = "DIVERGENCE_DETECTED"
    INCONCLUSIVE = "INCONCLUSIVE"
    CONFLICTING_EVIDENCE = "CONFLICTING_EVIDENCE"

class ConfidenceLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class SignalStatus(str, Enum):
    PASS = "PASS"
    WARNING = "WARNING"
    FAIL = "FAIL"
    SKIPPED = "SKIPPED"
    INCONCLUSIVE = "INCONCLUSIVE"

class DivergenceType(str, Enum):
    # Core types (existing baseline)
    FUNCTION_MISMATCH = "FUNCTION_MISMATCH"
    PARAMETER_MISMATCH = "PARAMETER_MISMATCH"
    CONTROL_FLOW_MISMATCH = "CONTROL_FLOW_MISMATCH"
    LOGIC_MISMATCH = "LOGIC_MISMATCH"
    NUMERICAL_MISMATCH = "NUMERICAL_MISMATCH"
    TYPE_MISMATCH = "TYPE_MISMATCH"
    EXCEPTION_MISMATCH = "EXCEPTION_MISMATCH"
    BEHAVIOURAL_MISMATCH = "BEHAVIOURAL_MISMATCH"
    MISSING_FUNCTION = "MISSING_FUNCTION"
    DEPENDENCY_MISMATCH = "DEPENDENCY_MISMATCH"

    # Expanded / Alias categories
    NUMERICAL_BEHAVIOUR_MISMATCH = "NUMERICAL_MISMATCH"
    EXCEPTION_BEHAVIOUR_MISMATCH = "EXCEPTION_MISMATCH"
    BOUNDARY_CONDITION_MISMATCH = "BEHAVIOURAL_MISMATCH"
    STRUCTURAL_MISMATCH = "FUNCTION_MISMATCH"
    SIGNATURE_MISMATCH = "PARAMETER_MISMATCH"
    OUTPUT_MISMATCH = "BEHAVIOURAL_MISMATCH"
    SPECIFICATION_CONFLICT = "LOGIC_MISMATCH"
    INSUFFICIENT_TEST_COVERAGE = "INSUFFICIENT_TEST_COVERAGE"
class SourceTier(str, Enum):
    TIER_1 = "TIER_1"
    TIER_2 = "TIER_2"
    TIER_3 = "TIER_3"

class ConflictStatus(str, Enum):
    NO_CONFLICT = "NO_CONFLICT"
    CONFLICTING_EVIDENCE = "CONFLICTING_EVIDENCE"

# --- Evidence & Conflict Schemas ---

class EvidenceItem(BaseModel):
    evidence_id: str
    source_name: str
    source_url: str
    source_tier: SourceTier
    authority_score: float = Field(..., ge=0.0, le=1.0)
    relevance: str
    citation_excerpt: str
    retrieved_at: str

class ConflictReport(BaseModel):
    status: ConflictStatus
    details: Optional[str] = None

# --- Request Schemas ---

class CodeFile(BaseModel):
    path: str = Field(..., description="File path relative to repository or unit root")
    content: str = Field(..., description="Raw text content of the code file")

class CodeArtifact(BaseModel):
    language: Language = Field(default=Language.PYTHON)
    files: List[CodeFile] = Field(..., min_length=1, description="List of source code files")

class VerifyRequest(BaseModel):
    source_artifact: CodeArtifact
    generated_artifact: CodeArtifact

# --- Verification & Audit Schemas ---

class MatchedUnit(BaseModel):
    source_unit_id: str
    generated_unit_id: Optional[str] = None
    name: str
    unit_type: str = "function"
    source_location: str
    generated_location: Optional[str] = None

class TestCaseResult(BaseModel):
    test_id: str
    input_data: Dict[str, Any]
    expected_output: Any
    actual_output: Any
    status: SignalStatus
    error: Optional[str] = None

class DivergenceDetail(BaseModel):
    divergence_id: str
    type: DivergenceType
    file: str
    function: str
    location: Optional[str] = None
    test_case: Optional[TestCaseResult] = None
    explanation: str
    expected_behaviour: str
    actual_behaviour: str
    evidence: Optional[List[EvidenceItem]] = Field(default_factory=list)

class VerificationSignals(BaseModel):
    structural: SignalStatus
    semantic: SignalStatus
    behavioural: SignalStatus

class AuditRecord(BaseModel):
    verifier_version: str
    timestamp: str
    source_hash: str
    generated_hash: str
    total_tests: int = 0
    passed_tests: int = 0
    divergences_count: int = 0

class VerifyResponse(BaseModel):
    verification_id: str
    verdict: VerificationVerdict
    confidence: ConfidenceLevel
    confidence_reasons: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    recommended_action: Optional[str] = None
    verifiability: Optional[VerifiabilityModel] = None
    verification_scopes: Optional[List[VerificationScopeItem]] = Field(default_factory=list)
    verification_signals: VerificationSignals
    matched_units: List[MatchedUnit] = Field(default_factory=list)
    divergences: List[DivergenceDetail] = Field(default_factory=list)
    conflict_report: Optional[ConflictReport] = None
    audit: AuditRecord

# --- Scenarios, Evaluation & Audit Snapshot Schemas ---

class ScenarioItem(BaseModel):
    scenario_id: str
    title: str
    category: str
    description: str
    language: Language = Language.PYTHON
    source_artifact: CodeArtifact
    generated_artifact: CodeArtifact
    expected_verdict: VerificationVerdict
    expected_divergence_type: Optional[DivergenceType] = None
    origin: str = "Team-created synthetic benchmark case."
    licence: str = "MIT"

class ScenariosResponse(BaseModel):
    total_scenarios: int
    scenarios: List[ScenarioItem]

class AuditSnapshot(BaseModel):
    verification_id: str
    source_artifact: CodeArtifact
    generated_artifact: CodeArtifact
    source_hash: str
    generated_hash: str
    timestamp: str
    verifier_version: str
    verdict: VerificationVerdict
    confidence: ConfidenceLevel
    confidence_reasons: List[str]
    verification_signals: VerificationSignals
    matched_units: List[MatchedUnit]
    divergences: List[DivergenceDetail]
    conflict_report: Optional[ConflictReport] = None
    audit_summary: AuditRecord

class EvaluationMetrics(BaseModel):
    behavioural_equivalence_pass_rate: float
    divergence_detection_accuracy: float
    false_positive_rate: float
    false_negative_rate: float
    mean_verification_latency_ms: float

class EvaluationCaseResult(BaseModel):
    scenario_id: str
    title: str
    category: str
    expected_verdict: VerificationVerdict
    actual_verdict: VerificationVerdict
    correct: bool
    latency_ms: float
    expected_divergence_type: Optional[DivergenceType] = None
    actual_divergences_count: int = 0

class EvaluationResponse(BaseModel):
    dataset_name: str
    total_cases: int
    metrics: EvaluationMetrics
    cases: List[EvaluationCaseResult]
    evaluated_at: str
# backend/models/schemas.py additions & updates

class VerificationVerdict(str, Enum):
    VERIFIED = "VERIFIED"
    DIVERGENCE_DETECTED = "DIVERGENCE_DETECTED"
    INCONCLUSIVE = "INCONCLUSIVE"
    CONFLICTING_EVIDENCE = "CONFLICTING_EVIDENCE"
    UNVERIFIABLE = "UNVERIFIABLE"

class VerifiabilityStatus(str, Enum):
    YES = "YES"
    PARTIAL = "PARTIAL"
    NO = "NO"

class VerificationScopeItem(BaseModel):
    name: str
    evaluated: bool
    status: SignalStatus
    details: Optional[str] = None

class VerifiabilityModel(BaseModel):
    verifiable: VerifiabilityStatus
    evaluated_scopes: List[str]
    unevaluated_scopes: List[str]
    limitations: List[str]