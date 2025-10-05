#!/usr/bin/env python3
"""
Script per verificare che i dati siano stati importati correttamente
"""

import sys
from pathlib import Path

# Aggiungi il percorso del backend al Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from db import SessionLocal
from models import Planet

def verify_import():
    """Verifica l'importazione dei dati nel database"""
    
    db = SessionLocal()
    
    try:
        # Conta totale
        total_count = db.query(Planet).count()
        print(f"📊 Totale pianeti nel database: {total_count}")
        
        # Statistiche per disposizione
        confirmed = db.query(Planet).filter(Planet.koi_disposition == "CONFIRMED").count()
        candidate = db.query(Planet).filter(Planet.koi_disposition == "CANDIDATE").count()
        false_positive = db.query(Planet).filter(Planet.koi_disposition == "FALSE POSITIVE").count()
        
        print(f"\n📈 Distribuzione per disposizione:")
        print(f"   CONFIRMED: {confirmed} ({confirmed/total_count*100:.1f}%)")
        print(f"   CANDIDATE: {candidate} ({candidate/total_count*100:.1f}%)")
        print(f"   FALSE POSITIVE: {false_positive} ({false_positive/total_count*100:.1f}%)")
        
        # Alcuni esempi di pianeti
        print(f"\n🌍 Primi 5 pianeti confermati:")
        confirmed_planets = db.query(Planet).filter(Planet.koi_disposition == "CONFIRMED").limit(5).all()
        for p in confirmed_planets:
            print(f"   {p.name}: R={p.radius:.2f} R⊕, T={p.eq_temp:.0f}K, Period={p.period:.1f}d")
        
        # Statistiche sui raggi
        planets_with_radius = db.query(Planet).filter(Planet.koi_prad.isnot(None)).all()
        if planets_with_radius:
            radii = [p.koi_prad for p in planets_with_radius if p.koi_prad is not None]
            print(f"\n📏 Statistiche sui raggi planetari:")
            print(f"   Pianeti con raggio valido: {len(radii)}")
            print(f"   Raggio minimo: {min(radii):.2f} R⊕")
            print(f"   Raggio massimo: {max(radii):.2f} R⊕")
            print(f"   Raggio medio: {sum(radii)/len(radii):.2f} R⊕")
        
        # Pianeti potenzialmente abitabili
        habitable = db.query(Planet).filter(
            Planet.koi_prad >= 0.5,
            Planet.koi_prad <= 3.0,
            Planet.koi_teq >= 273,
            Planet.koi_teq <= 320,
            Planet.koi_disposition == "CONFIRMED"
        ).count()
        
        print(f"\n🌍 Pianeti potenzialmente abitabili (confermati): {habitable}")
        
        # Test delle coordinate
        planets_with_coords = db.query(Planet).filter(
            Planet.ra.isnot(None),
            Planet.dec.isnot(None)
        ).count()
        
        print(f"🌌 Pianeti con coordinate valide: {planets_with_coords}")
        
        # Test degli indici (performance)
        print(f"\n🔍 Test performance indici:")
        import time
        
        # Test ricerca per raggio (indice)
        start = time.time()
        earth_like = db.query(Planet).filter(
            Planet.koi_prad >= 0.8, 
            Planet.koi_prad <= 1.3
        ).count()
        end = time.time()
        print(f"   Ricerca pianeti simili alla Terra: {earth_like} trovati in {(end-start)*1000:.1f}ms")
        
        # Test ricerca per temperatura (indice)
        start = time.time()
        temp_range = db.query(Planet).filter(
            Planet.koi_teq >= 250,
            Planet.koi_teq <= 350
        ).count()
        end = time.time()
        print(f"   Ricerca per temperatura: {temp_range} trovati in {(end-start)*1000:.1f}ms")
        
        print(f"\n✅ Verifica completata con successo!")
        return True
        
    except Exception as e:
        print(f"❌ Errore durante la verifica: {e}")
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🔍 Verifica importazione dati...")
    verify_import()