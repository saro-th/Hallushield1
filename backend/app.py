from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers from routes folder
from routes.verify import router as verify_router
from routes.scenarios import router as scenarios_router
from routes.audit import router as audit_router
from routes.evaluate import router as evaluate_router
from config import settings

app = FastAPI(
    title="Hallucination Hunter API",
    description="Inspectable verification layer for AI-generated code transformations",
    version=settings.verifier_version,
)

# Open CORS for seamless frontend collaboration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all endpoint routers with /api prefix AND base fallback
app.include_router(verify_router, prefix="/api")
app.include_router(scenarios_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(evaluate_router, prefix="/api")

# Also include without prefix so any non-prefixed tests remain 20/20 green
app.include_router(verify_router)
app.include_router(scenarios_router)
app.include_router(audit_router)
app.include_router(evaluate_router)

@app.get("/api/health", tags=["system"])
@app.get("/health", tags=["system"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Hallucination Hunter",
        "version": settings.verifier_version,
    }