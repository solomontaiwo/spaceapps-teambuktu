from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine
from routers import planets  # importa il router

app = FastAPI(title="A World Away - Exoplanet Backend", version="0.1.0")

# crea tabelle
Base.metadata.create_all(bind=engine)

# CORS per permettere le richieste dal frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # (in produzione metti il dominio del frontend)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# registra il router
app.include_router(planets.router)
