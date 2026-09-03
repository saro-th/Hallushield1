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

# Mount all endpoint routers
app.include_router(verify_router)
app.include_router(scenarios_router)
app.include_router(audit_router)
app.include_router(evaluate_router)

@app.get("/health", tags=["system"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Hallucination Hunter",
        "version": settings.verifier_version,
    }