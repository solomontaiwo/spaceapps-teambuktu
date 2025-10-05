import React, { useState } from 'react';
import { calculatePlanetSize, getPlanetCategoryColor, earthRadiiToKm, isInHabitableZone } from '../utils/planetSizeCalculations';
import { predictExoplanet, PredictionResult, testAIConnection } from '../api/predictions';
import './PlanetInfoPanel.css';

// Original fields from KOI_cleaned.csv for more details
interface PlanetData {
  id: string;
  name: string;
  radius: number;          
  period: number;          
  eq_temp: number;        
  koi_disposition?: string;
  koi_prad?: number;
  koi_period?: number;
  koi_teq?: number;
  koi_steff?: number;
  koi_srad?: number;
  ra?: number;
  dec?: number;
  source?: string;
}

interface PlanetInfoPanelProps {
  planet: PlanetData;
  onCompareWithEarth?: () => void;
  onClose?: () => void;
}

const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = ({
  planet,
  onCompareWithEarth,
  onClose
}) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect mobile for responsive layout
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // 🤖 Funzione per predire se è un Exoplanet
  const handlePredictHexaplanet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 🧪 Prima testa la connessione
      const isConnected = await testAIConnection();
      if (!isConnected) {
        throw new Error('Backend AI non raggiungibile');
      }

      const result = await predictExoplanet({
        name: planet.name,
        period: planet.period || planet.koi_period,
        radius: planet.radius || planet.koi_prad,
        eq_temp: planet.eq_temp || planet.koi_teq,
        star_temp: planet.koi_steff,
        star_radius: planet.koi_srad,
        ra: planet.ra,
        dec: planet.dec
      });
      
      setPrediction(result);
    } catch (err) {
      console.error('Errore predizione AI:', err);
      if (err instanceof Error) {
        if (err.message.includes('Backend AI non raggiungibile') || err.message.includes('fetch')) {
          setError('🚀 Backend AI offline! Avvia il server con: uvicorn main:app --reload --port 8000');
        } else {
          setError('🤖 Sistema AI temporaneamente non disponibile. Il nostro team di scienziati sta calibrando i telescopi!');
        }
      } else {
        setError('🤖 Errore sconosciuto nel sistema AI');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Utilizza i nuovi calcoli delle dimensioni planetarie
  const planetRadius = planet.radius || planet.koi_prad || 1;
  const planetTemp = planet.eq_temp || planet.koi_teq || 300;
  const planetPeriod = planet.period || planet.koi_period;
  
  const sizeInfo = calculatePlanetSize(planetRadius);
  const categoryColor = getPlanetCategoryColor(planetRadius);
  const planetKm = earthRadiiToKm(planetRadius);
  const isHabitable = isInHabitableZone(planetRadius, planetTemp);
  
  return (
    <div className="planet-info-panel">
      <div className="planet-header">
        <h2 title={planet.name}>
          {isMobile && planet.name.length > 20 
            ? `${planet.name.substring(0, 17)}...` 
            : planet.name}
        </h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="planet-type">
        <div 
          className="type-badge"
          style={{ backgroundColor: categoryColor }}
        >
          {sizeInfo.category}
        </div>
        {planet.koi_disposition && (
          <div className="disposition-badge">
            Status: {planet.koi_disposition}
          </div>
        )}
      </div>
      
      <div className="planet-stats">
        <div className="stat">
          <span className="label">🌡️ Temperatura:</span>
          <span className="value">{planetTemp.toFixed(0)}K ({(planetTemp - 273).toFixed(0)}°C)</span>
        </div>
        
        <div className="stat">
          <span className="label">📏 Dimensioni:</span>
          <span className="value">
            {sizeInfo.earthRadii.toFixed(2)}× Terra ({planetKm.toFixed(0)} km)
          </span>
        </div>
        
        <div className="stat">
          <span className="label">🌍 Abitabilità:</span>
          <span className={`value ${isHabitable ? 'habitable' : 'not-habitable'}`}>
            {isHabitable ? '✅ Zona Abitabile' : '❌ Non Abitabile'}
          </span>
        </div>
        
        {planetPeriod && (
          <div className="stat">
            <span className="label">🗓️ Periodo Orbitale:</span>
            <span className="value">{planetPeriod.toFixed(1)} giorni</span>
          </div>
        )}
        
        {planet.koi_steff && (
          <div className="stat">
            <span className="label">⭐ Temperatura Stella:</span>
            <span className="value">{planet.koi_steff.toFixed(0)}K</span>
          </div>
        )}
        
        {planet.koi_srad && (
          <div className="stat">
            <span className="label">☀️ Raggio Stella:</span>
            <span className="value">{planet.koi_srad.toFixed(2)}× Sole</span>
          </div>
        )}
        
        {planet.ra && planet.dec && (
          <div className="stat">
            <span className="label">🌌 Coordinate:</span>
            <span className="value">RA: {planet.ra.toFixed(3)}°, Dec: {planet.dec.toFixed(3)}°</span>
          </div>
        )}
      </div>
      
      <div className="planet-description">
        <h3>Classificazione: {sizeInfo.category}</h3>
        <p className="description">{sizeInfo.description}</p>
        <p className="comparison">
          <strong>Confronto:</strong> {sizeInfo.realWorldComparison}
        </p>
        
        <h4>Caratteristiche Planetarie:</h4>
        <ul>
          {sizeInfo.category.includes('Pianeta terrestre') && (
            <>
              <li>🪨 Superficie rocciosa solida</li>
              <li>🏔️ Possibili catene montuose e crateri</li>
              <li>� Potenziale attività geologica</li>
              {isHabitable && <li>💧 Condizioni favorevoli per l'acqua liquida</li>}
            </>
          )}
          
          {sizeInfo.category === 'Super-Terra' && (
            <>
              <li>� Gravità superiore alla Terra</li>
              <li>🛡️ Campo magnetico probabilmente forte</li>
              <li>�️ Atmosfera potenzialmente densa</li>
              {isHabitable && <li>🌊 Possibili oceani estesi</li>}
            </>
          )}
          
          {sizeInfo.category === 'Mini-Nettuno' && (
            <>
              <li>🌪️ Atmosfera spessa di idrogeno/elio</li>
              <li>💎 Nucleo roccioso/ghiacciato</li>
              <li>🌀 Possibili tempeste atmosferiche</li>
            </>
          )}
          
          {sizeInfo.category.includes('Gigante') && (
            <>
              <li>�️ Atmosfera massiccia e turbolenta</li>
              <li>🪐 Possibili sistemi di anelli</li>
              <li>🌙 Numerose lune satelliti</li>
              <li>💨 Venti supersonici nell'atmosfera</li>
            </>
          )}
          
          {sizeInfo.category === 'Pianeta nano' && (
            <>
              <li>�️ Superficie probabilmente rocciosa</li>
              <li>🌬️ Atmosfera molto sottile o assente</li>
              <li>❄️ Temperature estremamente fredde</li>
            </>
          )}
        </ul>
        
        {planet.source && (
          <div className="data-source">
            <small>📊 Fonte dati: {planet.source}</small>
          </div>
        )}
      </div>
      
      {/* 🤖 SEZIONE PREDIZIONE ML - Solo per CANDIDATI */}
      {planet.koi_disposition === 'CANDIDATE' && (
        <div style={{ 
          marginTop: "1rem", 
          padding: "0.8rem", 
          background: "rgba(255,255,255,0.1)", 
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <h3 style={{ 
            fontSize: "0.9rem", 
            color: "#ffeb3b", 
            marginBottom: "0.8rem",
            textAlign: "center"
          }}>
            🤖 HEXAPLANET AI ANALYSIS
          </h3>
          
          {!prediction && !error && (
            <button 
              onClick={handlePredictHexaplanet}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: isLoading ? "#666" : "linear-gradient(90deg, #ff9800, #f57c00)",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                transition: "all 0.3s ease"
              }}
            >
              {isLoading ? "🔄 ANALYZING..." : "🚀 CONFRONTA HEXAPLANET"}
            </button>
          )}
          
          {error && (
            <div style={{ 
              color: "#ff5252", 
              fontSize: "0.8rem", 
              textAlign: "center",
              padding: "0.5rem",
              background: "rgba(255,82,82,0.1)",
              borderRadius: "4px"
            }}>
              ❌ {error}
              <button
                onClick={() => setError(null)}
                style={{
                  background: "transparent",
                  border: "1px solid #ff5252",
                  color: "#ff5252",
                  borderRadius: "3px",
                  padding: "0.2rem 0.5rem",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  marginLeft: "0.5rem"
                }}
              >
                Retry
              </button>
            </div>
          )}
          
          {prediction && (
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                background: prediction.is_exoplanet 
                  ? "linear-gradient(90deg, #4caf50, #388e3c)" 
                  : "linear-gradient(90deg, #f44336, #d32f2f)",
                color: "white",
                padding: "0.8rem",
                borderRadius: "6px",
                marginBottom: "0.8rem",
                fontWeight: "bold",
                fontSize: "1rem"
              }}>
                {prediction.is_exoplanet ? "✅ HEXAPLANET" : "❌ FALSE POSITIVE"}
              </div>
              
              <div style={{ 
                fontSize: "0.85rem", 
                marginBottom: "0.8rem",
                color: "#e0e0e0"
              }}>
                <strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(1)}%
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setPrediction(null)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "#4dabf7",
                    border: "1px solid #4dabf7",
                    borderRadius: "4px",
                    padding: "0.4rem",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  🔄 New Analysis
                </button>
                {onCompareWithEarth && (
                  <button
                    onClick={onCompareWithEarth}
                    style={{
                      flex: 1,
                      background: "transparent",
                      color: "#81c784",
                      border: "1px solid #81c784",
                      borderRadius: "4px",
                      padding: "0.4rem",
                      cursor: "pointer",
                      fontSize: "0.8rem"
                    }}
                  >
                    🌍 vs Earth
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🌍 Pulsante confronto Terra - Solo se NON è CANDIDATE o predizione completata */}
      {(planet.koi_disposition !== 'CANDIDATE' || prediction) && onCompareWithEarth && (
        <button onClick={onCompareWithEarth} className="compare-btn">
          🌍 Confronta con la Terra
        </button>
      )}
    </div>
  );
};

export default PlanetInfoPanel;