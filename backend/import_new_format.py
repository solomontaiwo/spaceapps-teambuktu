"""
Script di importazione per il nuovo formato CSV senza campo name.
Utilizza le coordinate RA/DEC per identificare i pianeti.
"""

import csv
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Index
from sqlalchemy.orm import sessionmaker, declarative_base

# Configurazione database
SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modello Planet aggiornato
class Planet(Base):
    __tablename__ = "planets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=True)  # Ora opzionale
    ra = Column(Float, index=True)  # Right Ascension
    dec = Column(Float, index=True)  # Declination
    period = Column(Float, index=True)  # Periodo orbitale
    radius = Column(Float, index=True)  # Raggio planetario
    star_radius = Column(Float, index=True)  # Raggio stellare
    star_temp = Column(Float, index=True)  # Temperatura stellare
    eq_temp = Column(Float, index=True)  # Temperatura di equilibrio
    disposition = Column(String, index=True)  # CONFIRMED, CANDIDATE, FALSE POSITIVE
    source = Column(String)  # Sorgente dei dati

    __table_args__ = (
        Index('idx_planet_radius_temp', 'radius', 'eq_temp'),
        Index('idx_star_properties', 'star_radius', 'star_temp'),
        Index('idx_planet_habitability', 'radius', 'eq_temp', 'period'),
        Index('idx_celestial_coords', 'ra', 'dec'),
    )

def main():
    print("🚀 Importazione dati planetari dal nuovo CSV...")
    
    # Ricrea le tabelle con la nuova struttura
    Base.metadata.drop_all(bind=engine)  # Elimina tabelle esistenti
    Base.metadata.create_all(bind=engine)  # Ricrea con nuova struttura
    print("✅ Tabelle ricreate con nuova struttura")
    
    # Trova il file CSV
    csv_file = "data/KOI_cleaned.csv"
    if not os.path.exists(csv_file):
        print("❌ File CSV non trovato!")
        return
    
    print(f"📂 Trovato CSV: {csv_file}")
    
    # Funzione di conversione sicura
    def safe_float(val):
        try:
            if val and str(val).strip() not in ['', 'nan', 'NaN']:
                return float(val)
        except:
            pass
        return None
    
    # Leggi e importa i dati
    db = SessionLocal()
    count = 0
    skipped = 0
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            print(f"📊 Colonne disponibili: {list(reader.fieldnames)}")
            
            for row_index, row in enumerate(reader):
                # Estrai i dati principali
                ra = safe_float(row.get("ra"))
                dec = safe_float(row.get("dec"))
                radius = safe_float(row.get("koi_prad"))
                
                # Salta se mancano dati essenziali
                if ra is None or dec is None or radius is None or radius <= 0:
                    skipped += 1
                    continue
                
                # Genera un nome basato sulle coordinate
                name = f"KOI-{row_index+1:05d}"
                if ra is not None and dec is not None:
                    name = f"KOI-{row_index+1:05d}_RA{ra:.3f}_DEC{dec:.3f}"
                
                planet = Planet(
                    name=name,
                    ra=ra,
                    dec=dec,
                    period=safe_float(row.get("koi_period")),
                    radius=radius,
                    star_radius=safe_float(row.get("koi_srad")),
                    star_temp=safe_float(row.get("koi_steff")),
                    eq_temp=safe_float(row.get("koi_teq")),
                    disposition=row.get("koi_disposition", "UNKNOWN").strip(),
                    source=row.get("source", "Kepler").strip()
                )
                
                db.add(planet)
                count += 1
                
                if count % 500 == 0:
                    db.commit()
                    print(f"📝 Importati {count} pianeti...")
        
        db.commit()
        print(f"✅ Importazione completata!")
        print(f"📊 Pianeti importati: {count}")
        print(f"⚠️  Righe saltate (dati mancanti): {skipped}")
        
        # Verifica
        total = db.query(Planet).count()
        confirmed = db.query(Planet).filter(Planet.disposition == "CONFIRMED").count()
        candidates = db.query(Planet).filter(Planet.disposition == "CANDIDATE").count()
        
        print(f"\n📈 Statistiche database:")
        print(f"  • Pianeti totali: {total}")
        print(f"  • Confermati: {confirmed}")
        print(f"  • Candidati: {candidates}")
        
        # Mostra alcuni esempi
        examples = db.query(Planet).limit(5).all()
        print(f"\n🌍 Esempi di pianeti importati:")
        for p in examples:
            print(f"  - {p.name}: {p.radius}R⊕, {p.eq_temp}K, {p.disposition}")
            
    except Exception as e:
        print(f"❌ Errore: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()