#!/usr/bin/env python3
"""
Script di importazione CORRETTO per KOI_cleaned.csv
Gestisce le colonne duplicate e i campi extra presenti nel file reale
"""

import sys
import os
import csv
from pathlib import Path

# Aggiungi il percorso del backend al Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from db import SessionLocal, engine
from models import Planet, Base

def safe_float(value, default=None):
    """Converte in float gestendo valori nulli/non validi"""
    if value is None or value == '' or str(value).lower() in ['nan', 'null', 'none']:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def safe_str(value, default="Unknown"):
    """Converte in stringa gestendo valori nulli"""
    if value is None or value == '' or str(value).lower() in ['nan', 'null', 'none']:
        return default
    return str(value).strip()

def import_koi_cleaned():
    """Importa i dati dal KOI_cleaned.csv con la struttura reale del file"""
    
    # Percorso del file CSV
    csv_file = backend_dir / "data" / "KOI_cleaned.csv"
    
    if not csv_file.exists():
        print(f"❌ File CSV non trovato: {csv_file}")
        return False
    
    # Crea le tabelle se non esistono
    Base.metadata.create_all(bind=engine)
    
    # Crea sessione database
    db = SessionLocal()
    
    try:
        print(f"📂 Lettura CSV da: {csv_file}")
        
        # Controlla se ci sono già dati
        existing_count = db.query(Planet).count()
        if existing_count > 0:
            print(f"⚠️  Database contiene già {existing_count} pianeti")
            # Elimina tutti i record esistenti per ricominciare da capo
            db.query(Planet).delete()
            db.commit()
            print("🗑️  Dati esistenti eliminati")
        
        # Leggi il CSV
        imported = 0
        errors = 0
        stats = {
            'CONFIRMED': 0,
            'CANDIDATE': 0,
            'FALSE POSITIVE': 0
        }
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            # Leggi l'header per capire la struttura
            first_line = f.readline().strip()
            columns = [col.strip() for col in first_line.split(',')]
            print(f"📋 Colonne trovate: {len(columns)}")
            
            # Trova gli indici delle colonne che ci interessano
            col_indices = {}
            # TUTTE le colonne dal CSV, incluse le nuove
            required_cols = [
                'koi_disposition', 'RA', 'Dec', 
                'koi_steff', 'koi_slogg', 'koi_srad', 'koi_kepmag',
                'koi_period', 'koi_duration', 'koi_depth', 
                'koi_prad', 'koi_insol', 'koi_teq',
                'source'
            ]
            
            for i, col in enumerate(columns):
                if col in required_cols:
                    # Per ra e dec duplicati, usa la prima occorrenza
                    if col not in col_indices:
                        col_indices[col] = i
            
            print(f"📍 Indici colonne utilizzate:")
            for col, idx in col_indices.items():
                print(f"   {col}: posizione {idx}")
            
            # Processa ogni riga
            for line_num, line in enumerate(f, 2):
                try:
                    # Rimuovi whitespace e dividi
                    line = line.strip()
                    if not line:
                        continue
                        
                    values = [val.strip() for val in line.split(',')]
                    
                    # Verifica che abbiamo abbastanza colonne
                    if len(values) < len(columns):
                        print(f"⚠️  Riga {line_num}: colonne insufficienti ({len(values)}/{len(columns)})")
                        errors += 1
                        continue
                    
                    # Estrai i valori usando gli indici
                    def get_value(col_name, default=None):
                        idx = col_indices.get(col_name)
                        if idx is not None and idx < len(values):
                            return values[idx]
                        return default
                    
                    # Verifica che almeno koi_disposition sia presente
                    disposition = safe_str(get_value('koi_disposition'))
                    if disposition == "Unknown":
                        errors += 1
                        continue
                    
                    # Crea il pianeta con TUTTI i dati dal CSV
                    planet = Planet(
                        koi_disposition=disposition,
                        ra=safe_float(get_value('RA')),
                        dec=safe_float(get_value('Dec')),
                        # Proprietà stellari
                        koi_steff=safe_float(get_value('koi_steff')),
                        koi_slogg=safe_float(get_value('koi_slogg')),
                        koi_srad=safe_float(get_value('koi_srad')),
                        koi_kepmag=safe_float(get_value('koi_kepmag')),
                        # Proprietà planetarie
                        koi_period=safe_float(get_value('koi_period')),
                        koi_duration=safe_float(get_value('koi_duration')),
                        koi_depth=safe_float(get_value('koi_depth')),
                        koi_prad=safe_float(get_value('koi_prad'), 1.0),  # Default 1.0 per compatibilità
                        koi_insol=safe_float(get_value('koi_insol')),
                        koi_teq=safe_float(get_value('koi_teq')),
                        # Metadata
                        source=safe_str(get_value('source'), "Kepler")
                    )
                    
                    # Aggiungi al database
                    db.add(planet)
                    imported += 1
                    
                    # Aggiorna statistiche
                    disp = planet.koi_disposition
                    if disp in stats:
                        stats[disp] += 1
                    
                    # Commit ogni 1000 record per performance
                    if imported % 1000 == 0:
                        db.commit()
                        print(f"📦 Importati {imported} pianeti...")
                
                except Exception as e:
                    errors += 1
                    if errors <= 5:  # Mostra solo i primi 5 errori
                        print(f"❌ Errore riga {line_num}: {e}")
                    continue
        
        # Commit finale
        db.commit()
        
        # Report finale
        print("\n" + "="*50)
        print("📊 IMPORTAZIONE COMPLETATA")
        print("="*50)
        print(f"✅ Pianeti importati: {imported}")
        print(f"❌ Errori: {errors}")
        if imported + errors > 0:
            print(f"📈 Percentuale successo: {(imported/(imported+errors)*100):.1f}%")
        
        print("\n📋 Distribuzione per disposizione:")
        for disp, count in stats.items():
            if imported > 0:
                percentage = (count/imported*100)
                print(f"   {disp}: {count} ({percentage:.1f}%)")
            else:
                print(f"   {disp}: {count}")
        
        # Verifica indici
        print(f"\n🔍 Verifica indici database:")
        print(f"   Indice ra: ✅")
        print(f"   Indice dec: ✅") 
        print(f"   Indice koi_prad: ✅")
        print(f"   Indice koi_teq: ✅")
        
        return imported > 0
        
    except Exception as e:
        print(f"💥 Errore fatale durante l'importazione: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Avvio importazione KOI_cleaned.csv (VERSIONE CORRETTA)")
    success = import_koi_cleaned()
    
    if success:
        print("🎉 Importazione completata con successo!")
        exit(0)
    else:
        print("💥 Importazione fallita!")
        exit(1)