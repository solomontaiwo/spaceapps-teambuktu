"""
Script di importazione CSV senza dipendenze esterne (senza pandas)
Utilizza solo le librerie standard di Python
"""

import csv
import sys
import os

# Aggiungi il percorso del backend al sys.path per le importazioni
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from sqlalchemy.orm import Session
    from db import SessionLocal, engine, Base
    from models import Planet
except ImportError as e:
    print(f"❌ Errore importazione: {e}")
    print("💡 Assicurati di essere nella directory backend")
    print("💡 Controlla che i file db.py e models.py esistano")
    sys.exit(1)

def load_csv_to_db_simple(csv_path: str):
    """
    Carica i dati dal CSV al database senza usare pandas
    """
    print(f"📂 Caricamento CSV: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"❌ File non trovato: {csv_path}")
        return
    
    # CREA LE TABELLE SE NON ESISTONO
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelle database create/verificate")
    except Exception as e:
        print(f"❌ Errore creazione tabelle: {e}")
        return

    required_cols = [
        "kepoi_name",   # nome del pianeta
        "koi_period",   # periodo orbitale
        "koi_prad",     # raggio del pianeta
        "koi_srad",     # raggio della stella
        "koi_steff",    # temperatura stella
        "koi_teq"       # temperatura di equilibrio
    ]

    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            # Leggi la prima riga per ottenere le colonne
            csv_reader = csv.reader(file)
            headers = next(csv_reader)
            
            print(f"📊 Colonne trovate nel CSV: {headers}")
            
            # Verifica che le colonne richieste esistano
            missing = [col for col in required_cols if col not in headers]
            if missing:
                print(f"❌ Colonne mancanti: {missing}")
                return
            
            # Crea un mapping degli indici delle colonne
            col_indices = {col: headers.index(col) for col in required_cols}
            
            # Riporta il file all'inizio per rileggere con DictReader
            file.seek(0)
            csv_reader = csv.DictReader(file)
            
            db: Session = SessionLocal()
            
            count = 0
            errors = 0
            
            try:
                for row_num, row in enumerate(csv_reader, 1):
                    try:
                        # Estrai e converti i valori
                        name = row.get("kepoi_name", "").strip()
                        if not name:
                            continue
                            
                        # Conversione sicura dei valori numerici
                        def safe_float(value, default=None):
                            if not value or str(value).strip() in ['', 'nan', 'NaN', 'null']:
                                return default
                            try:
                                return float(value)
                            except (ValueError, TypeError):
                                return default
                        
                        period = safe_float(row.get("koi_period"))
                        radius = safe_float(row.get("koi_prad"))
                        star_radius = safe_float(row.get("koi_srad"))
                        star_temp = safe_float(row.get("koi_steff"))
                        eq_temp = safe_float(row.get("koi_teq"))
                        
                        # Crea il pianeta solo se abbiamo almeno il nome e il raggio
                        if name and radius is not None:
                            planet = Planet(
                                name=name,
                                period=period,
                                radius=radius,
                                star_radius=star_radius,
                                star_temp=star_temp,
                                eq_temp=eq_temp
                            )
                            
                            db.add(planet)
                            count += 1
                            
                            # Commit periodico per evitare problemi di memoria
                            if count % 100 == 0:
                                db.commit()
                                print(f"📝 Importati {count} pianeti...")
                    
                    except Exception as e:
                        errors += 1
                        if errors <= 5:  # Mostra solo i primi 5 errori
                            print(f"⚠️  Errore riga {row_num}: {e}")
                
                # Commit finale
                db.commit()
                print(f"✅ Importazione completata!")
                print(f"📊 Pianeti importati: {count}")
                print(f"⚠️  Errori: {errors}")
                
            except Exception as e:
                print(f"❌ Errore durante l'importazione: {e}")
                db.rollback()
            finally:
                db.close()
                
    except Exception as e:
        print(f"❌ Errore lettura file CSV: {e}")

def main():
    """Funzione principale"""
    print("🚀 Avvio importazione dati planetari...")
    
    # Percorsi possibili per il file CSV
    possible_paths = [
        "data/KOI_cleaned.csv",
        "../data/KOI_cleaned.csv",
        "./KOI_cleaned.csv",
        "KOI_cleaned.csv"
    ]
    
    csv_path = None
    for path in possible_paths:
        if os.path.exists(path):
            csv_path = path
            break
    
    if not csv_path:
        print("❌ File KOI_cleaned.csv non trovato nei percorsi:")
        for path in possible_paths:
            print(f"   - {path}")
        return
    
    print(f"📂 Trovato file CSV: {csv_path}")
    load_csv_to_db_simple(csv_path)

if __name__ == "__main__":
    main()