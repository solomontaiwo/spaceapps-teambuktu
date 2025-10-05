#!/usr/bin/env python3
"""
Script per ricreare il database con la nuova struttura che include tutte le colonne
"""

import sys
import os
from pathlib import Path

# Aggiungi il percorso del backend al Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from db import engine
from models import Base

def recreate_database():
    """Elimina e ricrea tutte le tabelle"""
    
    db_path = backend_dir / "database.db"
    
    print("🗑️  Eliminazione vecchie tabelle...")
    Base.metadata.drop_all(bind=engine)
    
    print("🏗️  Creazione nuove tabelle con tutte le colonne...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database ricreato con successo!")
    print(f"📂 Posizione: {db_path}")
    print("\n📋 Nuove colonne aggiunte:")
    print("   - koi_slogg (gravità stellare)")
    print("   - koi_kepmag (magnitudine Kepler)")
    print("   - koi_duration (durata transito)")
    print("   - koi_depth (profondità transito)")
    print("   - koi_insol (insolazione)")
    print("\n🚀 Ora puoi eseguire import_fixed.py per importare i dati!")

if __name__ == "__main__":
    recreate_database()
