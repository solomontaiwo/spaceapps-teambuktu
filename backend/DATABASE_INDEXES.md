# Indici Database per Ricerche Ottimizzate

## Panoramica

Questo documento descrive gli indici aggiunti al database per migliorare le performance delle ricerche e implementare algoritmi di ricerca binaria efficienti sui dati degli esopianeti.

## Indici Implementati

### Indici Singoli

1. **`idx_planets_name`** - Indice su `name`
   - **Scopo**: Ricerche rapide per nome pianeta
   - **Utilizzo**: Query con filtri `WHERE name LIKE '%pattern%'`
   - **Performance**: O(log n) per ricerche esatte, ottimizzato per ricerche parziali

2. **`idx_planets_radius`** - Indice su `radius`
   - **Scopo**: Ricerca binaria per raggio planetario
   - **Utilizzo**: Range queries per raggio (es. 0.5 < radius < 2.0)
   - **Performance**: O(log n) per ricerche per range

3. **`idx_planets_period`** - Indice su `period`
   - **Scopo**: Ricerca binaria per periodo orbitale
   - **Utilizzo**: Filtri su periodo orbitale
   - **Performance**: O(log n) per ordinamento e range queries

4. **`idx_planets_star_temp`** - Indice su `star_temp`
   - **Scopo**: Ricerca binaria per temperatura stellare
   - **Utilizzo**: Filtri su temperatura della stella ospite
   - **Performance**: O(log n) per ricerche per range

5. **`idx_planets_eq_temp`** - Indice su `eq_temp`
   - **Scopo**: Ricerca binaria per temperatura di equilibrio
   - **Utilizzo**: Ricerca pianeti con temperature abitabili
   - **Performance**: O(log n) per ricerche per range

6. **`idx_planets_star_radius`** - Indice su `star_radius`
   - **Scopo**: Ricerca binaria per raggio stellare
   - **Utilizzo**: Filtri su dimensioni della stella ospite
   - **Performance**: O(log n) per ricerche per range

### Indici Compositi

1. **`idx_planet_radius_temp`** - Indice composito su `(radius, eq_temp)`
   - **Scopo**: Ricerca ottimizzata per pianeti simili alla Terra
   - **Utilizzo**: Query che filtrano contemporaneamente per raggio e temperatura
   - **Performance**: O(log n) per ricerche congiunte

2. **`idx_star_properties`** - Indice composito su `(star_radius, star_temp)`
   - **Scopo**: Ricerca basata sulle proprietà stellari
   - **Utilizzo**: Analisi dei sistemi stellari
   - **Performance**: O(log n) per ricerche sui parametri stellari

3. **`idx_planet_habitability`** - Indice composito su `(radius, eq_temp, period)`
   - **Scopo**: Valutazione dell'abitabilità planetaria
   - **Utilizzo**: Ricerca nella zona abitabile con criteri multipli
   - **Performance**: O(log n) per analisi di abitabilità complesse

## Algoritmi di Ricerca Implementati

### Ricerca Binaria per Range
```sql
-- Esempio: pianeti con raggio tra 0.8 e 1.2 raggi terrestri
SELECT * FROM planets 
WHERE radius >= 0.8 AND radius <= 1.2 
ORDER BY radius;
```

### Ricerca Ottimizzata per Pianeti Terrestri
```sql
-- Utilizza l'indice composito idx_planet_radius_temp
SELECT * FROM planets 
WHERE radius BETWEEN 0.5 AND 1.5 
  AND eq_temp BETWEEN 250 AND 320
ORDER BY radius, eq_temp;
```

### Ricerca nella Zona Abitabile
```sql
-- Utilizza l'indice composito idx_planet_habitability
SELECT * FROM planets 
WHERE radius BETWEEN 0.5 AND 2.0 
  AND eq_temp BETWEEN 200 AND 350
  AND period BETWEEN 0.1 AND 500
ORDER BY radius, eq_temp, period;
```

## API Endpoints Ottimizzati

### Nuovi Endpoint per Ricerche Veloci

1. **`GET /api/search/by-radius`**
   - Parametri: `min_radius`, `max_radius`
   - Ricerca binaria per raggio planetario

2. **`GET /api/search/by-temperature`**
   - Parametri: `min_temp`, `max_temp`
   - Ricerca binaria per temperatura

3. **`GET /api/search/earth-like`**
   - Parametri: `radius_tolerance`, `temp_tolerance`
   - Ricerca pianeti simili alla Terra

4. **`GET /api/search/habitable-zone`**
   - Parametri: range per raggio, temperatura, periodo
   - Ricerca nella zona abitabile

5. **`GET /api/search/sorted`**
   - Parametri: `field`, `limit`, `ascending`
   - Ordinamento ottimizzato per qualsiasi campo

## Performance Attese

### Prima degli Indici
- Ricerca per nome: O(n) - scansione completa della tabella
- Range queries: O(n) - scansione completa per ogni criterio
- Ordinamento: O(n log n) - sorting su dati non indicizzati

### Dopo gli Indici
- Ricerca per nome: O(log n) - utilizzo B-tree index
- Range queries: O(log n + k) - dove k è il numero di risultati
- Ordinamento: O(k) - dati già ordinati nell'indice
- Query composite: O(log n + k) - utilizzo indici compositi

## Utilizzo degli Indici

### Script di Migrazione
Eseguire `python migrate_add_indexes.py` per:
- Creare tutti gli indici se non esistono
- Ottimizzare il database con `ANALYZE`
- Verificare la creazione degli indici
- Mostrare statistiche del database

### Funzioni di Utilità
La classe `PlanetSearchOptimized` in `utils/optimized_search.py` fornisce:
- Metodi di ricerca binaria ottimizzati
- Sfruttamento automatico degli indici
- Interfaccia semplificata per query complesse

## Monitoraggio Performance

### Query di Verifica
```sql
-- Verifica indici esistenti
SELECT name FROM sqlite_master 
WHERE type='index' AND tbl_name='planets';

-- Statistiche di utilizzo (SQLite)
EXPLAIN QUERY PLAN 
SELECT * FROM planets 
WHERE radius BETWEEN 0.8 AND 1.2;
```

### Metriche da Monitorare
- Tempo di risposta delle query
- Utilizzo degli indici (query plan)
- Dimensione del database
- Tempo di inserimento (possibile rallentamento)

## Best Practices

1. **Utilizzo degli Indici Compositi**
   - Ordinare i campi per selettività (più selettivo prima)
   - Utilizzare per query che filtrano su più campi contemporaneamente

2. **Manutenzione**
   - Eseguire `ANALYZE` periodicamente per aggiornare le statistiche
   - Monitorare la crescita del database

3. **Query Optimization**
   - Utilizzare `EXPLAIN QUERY PLAN` per verificare l'uso degli indici
   - Evitare funzioni sulle colonne indicizzate nei `WHERE`

## Conclusioni

L'implementazione di questi indici migliora significativamente le performance delle ricerche, permettendo:
- Ricerche binarie efficienti O(log n)
- Query di range ottimizzate
- Ordinamenti rapidi
- Analisi complesse di abitabilità planetaria

Gli indici compositi sono particolarmente utili per ricerche scientifiche che combinano più parametri fisici dei pianeti e delle stelle ospiti.