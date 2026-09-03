1. CURRENT PROJECT UNDERSTANDINGHallucination Hunter is an inspectable verification layer for AI-generated Python artefacts. The backend verification engine is fully complete (18/18 automated tests passing) with Pydantic v2 schemas, AST parsing, structural divergence analysis, boundary test generation, sandboxed subprocess execution, and in-memory audit snapshots. The project currently bridges its backend capabilities into a unified, real-world product experience featuring direct file/code inputs, side-by-side code inspection, audit trails, exportable reports, and safe email notifications.2. MILESTONE GOALPackage the Hallucination Hunter repository with a comprehensive, professional README.md that reflects its real-world productization, safe sandboxed architecture, verification workflow, and API integration.3. FILES TO CREATE/MODIFYREADME.md (Create/Overwrite)4. IMPLEMENTATIONMarkdown# Hallucination Hunter 🛡️🔍

> *An inspectable verification layer for AI-generated code transformations.*

[![Tests](https://img.shields.io/badge/tests-18%2F18%20passing-brightgreen)](http://127.0.0.1:8000/docs)
[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-teal)](https://fastapi.tiangolo.com/)

---

## 🚀 Product Vision

AI can generate and transform software quickly. The difficult part is knowing whether the generated artefact still behaves correctly. **Hallucination Hunter** helps developers and reviewers automatically and inspectably determine whether an AI-generated code artefact faithfully implements the intended behaviour of the source artefact.

> **Important Product Principle:** Compilation, syntax correctness, passing a few tests, or LLM confidence are **not** proof of equivalence. Hallucination Hunter uses structural, semantic, and sandboxed behavioural testing to detect divergences, never claiming formal equivalence unless mathematically proven.

---

## ✨ Key Features

- **Real Artefact Input:** Submit source and AI-generated Python code via text paste or file upload, alongside optional specifications.
- **Structural + Behavioural Analysis:** Goes beyond text diffing to parse ASTs, match functions, generate boundary tests, and execute them in a sandboxed subprocess.
- **Divergence Localisation:** Identifies exact failing inputs, expected vs. actual outputs, and root-cause classifications (e.g., `BOUNDARY_CONDITION`, `CONTROL_FLOW_MISMATCH`).
- **Reproducible Audit Trail:** Generates verifiable audit snapshots stored in-memory with unique verification IDs (`HH-...`).
- **Reporting & Export:** Export individual verification reports (JSON/Markdown) or securely dispatch them via email (with safe development/fallback mode when unconfigured).
- **Safe Sandbox Execution:** Protects the host system against runaway code (e.g., infinite loops like `while True: pass`) using strict timeouts and subprocess isolation.

---

## 🛠️ Technical Architecture

```text
React/Vite Frontend
        ↓
FastAPI Backend (/api/verify, /api/audit, etc.)
        ↓
Existing Verification Engine
        ├── Structural Analysis (AST Parsing & Unit Matching)
        ├── Semantic & Evidence Analysis
        ├── Sandboxed Behavioural Testing (Subprocess Isolation)
        └── Divergence Localisation & Verdict Generation
🚦 Getting StartedPrerequisitesPython 3.10 or higherNode.js 18+ (for frontend)Pip / PoetryBackend SetupNavigate to the backend directory and install dependencies:Bashpip install -r requirements.txt
Run the FastAPI development server:Bashuvicorn main:app --reload --port 8000
Access the interactive API docs:Swagger UI: http://127.0.0.1:8000/docsFrontend SetupNavigate to the frontend directory:Bashcd frontend
Install dependencies:Bashnpm install
Run the development server:Bashnpm run dev
```text
🔌 Core API EndpointsMethodEndpointDescriptionPOST/api/verifySubmits source and generated artifacts for complete verification.GET/api/scenariosRetrieves built-in regression and demonstration scenarios.GET/api/audit/{id}Retrieves a reproducible audit snapshot for a given verification ID.GET/api/audit/{id}/exportExports an individual verification report.POST/api/audit/{id}/emailDispatches the verification report via email (or logs payload in dev mode).GET/api/evaluateReturns benchmark performance metrics and pass rates.🔒 Security & Sandbox GuaranteesUser-submitted code is never executed directly inside the FastAPI process. The execution engine enforces:Subprocess Isolation: Separate execution boundaries.Strict Timeouts: Automatic termination for blocking tasks or infinite loops.Environment Scrubbing: No access to sensitive host secrets or unrestricted network sockets.📝 LicenseThis project is licensed under the terms specified in the repository.
## 5. WHY THIS IMPLEMENTATION

A clean, structured Markdown README directly informs developers and evaluators of the project's purpose, architecture, setup steps, and security guarantees without cluttering the core codebase. It adheres strictly to the product positioning and technical rules outlined in the milestone prompt.

## 6. TESTS

- Automated backend verification suite (`18/18 tests passing`).
- Run pytest to validate engine integrity:
  ```bash
  pytest
7. RUN / VERIFYBash# Verify backend tests
pytest -v

# Start backend server
uvicorn main:app --reload --port 8000


8. EXPECTED RESULTA comprehensive root README.md file placed in the repository that clearly documents the Hallucination Hunter workflow, setup instructions, and API endpoints.9. NEXT STEPPerform end-to-end user journey validation across the frontend interface and backend endpoints.
🚦 Getting StartedPrerequisitesPython 3.10 or higherNode.js 18+ (for frontend)Pip / PoetryBackend SetupNavigate to the backend directory and install dependencies:Bashpip install -r requirements.txt
Run the FastAPI development server:Bashuvicorn main:app --reload --port 8000
Access the interactive API docs:Swagger UI: http://127.0.0.1:8000/docsFrontend SetupNavigate to the frontend directory:Bashcd frontend
Install dependencies:Bashnpm install
Run the development server:Bashnpm run dev
🔌 Core API EndpointsMethodEndpointDescriptionPOST/api/verifySubmits source and generated artifacts for complete verification.GET/api/scenariosRetrieves built-in regression and demonstration scenarios.GET/api/audit/{id}Retrieves a reproducible audit snapshot for a given verification ID.GET/api/audit/{id}/exportExports an individual verification report.POST/api/audit/{id}/emailDispatches the verification report via email (or logs payload in dev mode).GET/api/evaluateReturns benchmark performance metrics and pass rates.🔒 Security & Sandbox GuaranteesUser-submitted code is never executed directly inside the FastAPI process. The execution engine enforces:Subprocess Isolation: Separate execution boundaries.Strict Timeouts: Automatic termination for blocking tasks or infinite loops.Environment Scrubbing: No access to sensitive host secrets or unrestricted network sockets.📝 LicenseThis project is licensed under the terms specified in the repository.
## 5. WHY THIS IMPLEMENTATION

A clean, structured Markdown README directly informs developers and evaluators of the project's purpose, architecture, setup steps, and security guarantees without cluttering the core codebase. It adheres strictly to the product positioning and technical rules outlined in the milestone prompt.

## 6. TESTS

- Automated backend verification suite (`18/18 tests passing`).
- Run pytest to validate engine integrity:
  ```bash
  pytest
7. RUN / VERIFYBash# Verify backend tests
pytest -v

# Start backend server
uvicorn main:app --reload --port 8000
8. EXPECTED RESULTA comprehensive root README.md file placed in the repository that clearly documents the Hallucination Hunter workflow, setup instructions, and API endpoints.9. NEXT STEPPerform end-to-end user journey validation across the frontend interface and backend endpoints.
