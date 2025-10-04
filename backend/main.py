from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine
from routers import planets, similarity  # ✅ includi anche similarity se serve

app = FastAPI(title="A World Away - Exoplanet Backend", version="0.1.0")

# ✅ Crea le tabelle (se usi SQLAlchemy)
Base.metadata.create_all(bind=engine)

# ✅ Abilita CORS per il frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione: ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Registra i router con prefisso coerente
app.include_router(planets.router, prefix="/api", tags=["Planets"])
app.include_router(similarity.router, prefix="/api", tags=["Similarity"])

# ✅ Rotta di test per verificare che il backend risponde
@app.get("/")
def root():
    return {"status": "Backend attivo 🚀"}
