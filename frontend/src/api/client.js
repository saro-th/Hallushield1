const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

export async function verifyArtifact(sourceCode, generatedCode) {
  const payload = {
    source_artifact: {
      language: 'python',
      files: [{ path: 'main.py', content: sourceCode }],
    },
    generated_artifact: {
      language: 'python',
      files: [{ path: 'main.py', content: generatedCode }],
    },
  };

  const res = await fetch(`${API_BASE}/api/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = `Verification failed (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      const errText = await res.text();
      if (errText) errorDetail = errText;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function getScenarios() {
  const res = await fetch(`${API_BASE}/api/scenarios`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to load benchmark scenarios (HTTP ${res.status})`);
  }
  return res.json();
}

export async function getAudit(verificationId) {
  const res = await fetch(`${API_BASE}/api/audit/${encodeURIComponent(verificationId)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Audit record unavailable for ID: ${verificationId} (HTTP ${res.status})`);
  }
  return res.json();
}

export async function getEvaluation() {
  const res = await fetch(`${API_BASE}/api/evaluate`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Benchmark evaluation metrics unavailable (HTTP ${res.status})`);
  }
  return res.json();
}

export async function downloadEvaluationExport() {
  const res = await fetch(`${API_BASE}/api/evaluate/export`, {
    headers: { Accept: 'text/markdown' },
  });
  if (!res.ok) {
    throw new Error(`Export report failed (HTTP ${res.status})`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hallucination_hunter_benchmark_${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}