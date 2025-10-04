from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import planets, similarity

app = FastAPI(title="A World Away - Exoplanet Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # puoi restringerlo a ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ usa prefisso coerente
app.include_router(planets.router, prefix="/api", tags=["Planets"])
app.include_router(similarity.router, prefix="/api", tags=["Similarity"])

@app.get("/")
def root():
    return {"message": "Backend attivo 🚀"}
