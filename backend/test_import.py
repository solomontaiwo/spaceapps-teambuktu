"""
Test script minimo per importare i dati CSV
"""

import csv
import os
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base

# Configurazione database
SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modello Planet semplificato
class Planet(Base):
    __tablename__ = "planets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    period = Column(Float, index=True)
    radius = Column(Float, index=True)
    star_radius = Column(Float, index=True)
    star_temp = Column(Float, index=True)
    eq_temp = Column(Float, index=True)

def main():
    print("🚀 Test importazione dati planetari...")
    
    # Crea le tabelle
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelle create")
    
    # Trova il file CSV
    csv_paths = [
        "data/KOI_cleaned.csv",
        "data\\KOI_cleaned.csv",
        "../data/KOI_cleaned.csv"
    ]
    
    csv_file = None
    for path in csv_paths:
        if os.path.exists(path):
            csv_file = path
            break
    
    if not csv_file:
        print("❌ File CSV non trovato!")
        print("Percorsi testati:")
        for path in csv_paths:
            print(f"  - {path} -> {'✅' if os.path.exists(path) else '❌'}")
        return
    
    print(f"📂 Trovato CSV: {csv_file}")
    
    # Leggi e importa i dati
    db = SessionLocal()
    count = 0
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            # Mostra le prime colonne
            first_row = next(reader)
            print(f"📊 Colonne disponibili: {list(first_row.keys())}")
            
            # Riporta il file all'inizio
            file.seek(0)
            reader = csv.DictReader(file)
            
            # Conversione sicura per i valori numerici
            def safe_float(val):
                try:
                    return float(val) if val and str(val).strip() not in ['', 'nan'] else None
                except:
                    return None
            
            for row_index, row in enumerate(reader):
                # Crea un nome unico per il pianeta basato sui dati disponibili
                ra = safe_float(row.get("ra"))
                dec = safe_float(row.get("dec"))
                period = safe_float(row.get("koi_period"))
                
                # Genera un nome unico basato sulla posizione e periodo
                if ra is not None and dec is not None:
                    name = f"KOI-{row_index+1:05d}_RA{ra:.3f}_DEC{dec:.3f}"
                else:
                    name = f"KOI-{row_index+1:05d}"
                
                # Verifica che il pianeta abbia almeno un raggio valido
                radius = safe_float(row.get("koi_prad"))
                if not radius or radius <= 0:
                    continue
                
                planet = Planet(
                    name=name,
                    period=period,
                    radius=radius,
                    star_radius=safe_float(row.get("koi_srad")),
                    star_temp=safe_float(row.get("koi_steff")),
                    eq_temp=safe_float(row.get("koi_teq"))
                )
                
                db.add(planet)
                count += 1
                
                if count % 100 == 0:
                    db.commit()
                    print(f"📝 Importati {count} pianeti...")
                
                # Limita per test iniziale
                if count >= 1000:  # Importa i primi 1000 per test
                    break
        
        db.commit()
        print(f"✅ Importazione completata! Totale: {count} pianeti")
        
        # Verifica
        total = db.query(Planet).count()
        print(f"📊 Pianeti nel database: {total}")
        
        # Mostra alcuni esempi
        examples = db.query(Planet).limit(5).all()
        print("\n🌍 Esempi di pianeti importati:")
        for p in examples:
            print(f"  - {p.name}: {p.radius}R⊕, {p.eq_temp}K")
            
    except Exception as e:
        print(f"❌ Errore: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()