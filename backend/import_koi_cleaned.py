"""
Script di importazione finale per KOI_cleaned.csv
Mappa esattamente le colonne del CSV al nuovo modello database.
"""

import csv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Planet, Base

# Configurazione database
SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def safe_float(value):
    """Conversione sicura a float."""
    try:
        if value and str(value).strip() not in ['', 'nan', 'NaN', 'null']:
            return float(value)
    except (ValueError, TypeError):
        pass
    return None

def import_koi_cleaned():
    """Importa i dati dal file KOI_cleaned.csv nel database."""
    
    print("🚀 Importazione KOI_cleaned.csv...")
    
    # Ricrea le tabelle con la struttura aggiornata
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database ricreato con struttura per KOI_cleaned.csv")
    
    csv_file = "data/KOI_cleaned.csv"
    if not os.path.exists(csv_file):
        print(f"❌ File non trovato: {csv_file}")
        return
    
    db = SessionLocal()
    count = 0
    errors = 0
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            print(f"📊 Colonne CSV: {list(reader.fieldnames)}")
            
            for row in reader:
                try:
                    # Verifica che abbiamo i dati essenziali
                    koi_prad = safe_float(row.get('koi_prad'))
                    if not koi_prad or koi_prad <= 0:
                        continue  # Salta pianeti senza raggio valido
                    
                    planet = Planet(
                        # Coordinate
                        ra=safe_float(row.get('ra')),
                        dec=safe_float(row.get('dec')),
                        
                        # Proprietà planetarie
                        koi_disposition=row.get('koi_disposition', '').strip(),
                        koi_period=safe_float(row.get('koi_period')),
                        koi_prad=koi_prad,  # RAGGIO PLANETARIO - IMPORTANTE!
                        koi_teq=safe_float(row.get('koi_teq')),
                        
                        # Proprietà stellari  
                        koi_steff=safe_float(row.get('koi_steff')),
                        koi_srad=safe_float(row.get('koi_srad')),
                        koi_slogg=safe_float(row.get('koi_slogg')),
                        koi_kepmag=safe_float(row.get('koi_kepmag')),
                        
                        # Altri dati
                        koi_duration=safe_float(row.get('koi_duration')),
                        koi_depth=safe_float(row.get('koi_depth')),
                        koi_insol=safe_float(row.get('koi_insol')),
                        source=row.get('source', 'Kepler').strip()
                    )
                    
                    db.add(planet)
                    count += 1
                    
                    if count % 1000 == 0:
                        db.commit()
                        print(f"📝 Importati {count} pianeti...")
                        
                except Exception as e:
                    errors += 1
                    if errors <= 5:  # Mostra solo i primi errori
                        print(f"⚠️  Errore riga {count + errors}: {e}")
        
        db.commit()
        
        # Statistiche finali
        total = db.query(Planet).count()
        confirmed = db.query(Planet).filter(Planet.koi_disposition == "CONFIRMED").count()
        candidates = db.query(Planet).filter(Planet.koi_disposition == "CANDIDATE").count()
        false_pos = db.query(Planet).filter(Planet.koi_disposition == "FALSE POSITIVE").count()
        
        print(f"\n✅ Importazione completata!")
        print(f"📊 Statistiche:")
        print(f"  • Pianeti totali: {total:,}")
        print(f"  • Confermati: {confirmed:,}")
        print(f"  • Candidati: {candidates:,}")
        print(f"  • Falsi positivi: {false_pos:,}")
        print(f"  • Errori: {errors}")
        
        # Esempi per verifica
        samples = db.query(Planet).limit(3).all()
        print(f"\n🌍 Esempi importati:")
        for p in samples:
            print(f"  • {p.name}: {p.koi_prad}R⊕, {p.koi_teq}K, {p.koi_disposition}")
            
        # Verifica range raggi per dimensioni 3D
        min_radius = db.query(Planet.koi_prad).filter(Planet.koi_prad.isnot(None)).order_by(Planet.koi_prad).first()
        max_radius = db.query(Planet.koi_prad).filter(Planet.koi_prad.isnot(None)).order_by(Planet.koi_prad.desc()).first()
        
        if min_radius and max_radius:
            print(f"\n📏 Range raggi planetari:")
            print(f"  • Minimo: {min_radius[0]:.2f} R⊕")
            print(f"  • Massimo: {max_radius[0]:.2f} R⊕")
            print(f"  🎯 Perfetto per calcolo dimensioni 3D!")
        
    except Exception as e:
        print(f"❌ Errore importazione: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_koi_cleaned()