"""
Script di migrazione per aggiungere indici al database per migliorare le performance
delle ricerche e implementare algoritmi di ricerca binaria.
"""

import sqlite3
import os
from pathlib import Path

# Percorso del database
DB_PATH = Path(__file__).parent / "database.db"

def add_indexes():
    """Aggiunge gli indici al database esistente per migliorare le performance."""
    
    print("🔧 Connessione al database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Lista degli indici da creare
        indexes = [
            # Indici singoli per ricerca binaria veloce
            "CREATE INDEX IF NOT EXISTS idx_planets_name ON planets(name)",
            "CREATE INDEX IF NOT EXISTS idx_planets_period ON planets(period)",
            "CREATE INDEX IF NOT EXISTS idx_planets_radius ON planets(radius)",
            "CREATE INDEX IF NOT EXISTS idx_planets_star_radius ON planets(star_radius)",
            "CREATE INDEX IF NOT EXISTS idx_planets_star_temp ON planets(star_temp)",
            "CREATE INDEX IF NOT EXISTS idx_planets_eq_temp ON planets(eq_temp)",
            
            # Indici compositi per query complesse
            "CREATE INDEX IF NOT EXISTS idx_planet_radius_temp ON planets(radius, eq_temp)",
            "CREATE INDEX IF NOT EXISTS idx_star_properties ON planets(star_radius, star_temp)",
            "CREATE INDEX IF NOT EXISTS idx_planet_habitability ON planets(radius, eq_temp, period)",
        ]
        
        print("📊 Creazione indici in corso...")
        for i, index_sql in enumerate(indexes, 1):
            print(f"  [{i}/{len(indexes)}] Creando indice...")
            cursor.execute(index_sql)
            
        # Commit delle modifiche
        conn.commit()
        print("✅ Tutti gli indici sono stati creati con successo!")
        
        # Verifica degli indici creati
        print("\n📋 Verifica indici esistenti:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='planets'")
        indexes_in_db = cursor.fetchall()
        
        for idx in indexes_in_db:
            print(f"  ✓ {idx[0]}")
            
        # Ottimizzazione del database
        print("\n🔄 Ottimizzazione database in corso...")
        cursor.execute("ANALYZE")
        conn.commit()
        print("✅ Ottimizzazione completata!")
        
    except sqlite3.Error as e:
        print(f"❌ Errore durante la creazione degli indici: {e}")
        conn.rollback()
        raise
        
    finally:
        conn.close()
        print("🔐 Connessione al database chiusa.")

def check_database_stats():
    """Mostra statistiche del database dopo l'aggiunta degli indici."""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Conta il numero di pianeti
        cursor.execute("SELECT COUNT(*) FROM planets")
        planet_count = cursor.fetchone()[0]
        
        # Conta il numero di indici
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name='planets'")
        index_count = cursor.fetchone()[0]
        
        print(f"\n📊 Statistiche Database:")
        print(f"  • Pianeti totali: {planet_count:,}")
        print(f"  • Indici sulla tabella planets: {index_count}")
        
        # Dimensione del database
        db_size = os.path.getsize(DB_PATH) / (1024 * 1024)  # MB
        print(f"  • Dimensione database: {db_size:.2f} MB")
        
    except sqlite3.Error as e:
        print(f"❌ Errore durante la lettura delle statistiche: {e}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Avvio migrazione database per aggiunta indici...")
    print(f"📍 Database: {DB_PATH}")
    
    if not DB_PATH.exists():
        print("❌ File database non trovato! Assicurati che il database esista.")
        exit(1)
    
    try:
        add_indexes()
        check_database_stats()
        print("\n🎉 Migrazione completata con successo!")
        print("💡 Gli indici miglioreranno significativamente le performance delle ricerche binarie.")
        
    except Exception as e:
        print(f"\n💥 Errore durante la migrazione: {e}")
        exit(1)