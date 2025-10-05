import React from 'react';
import { calculatePlanetSize, getPlanetCategoryColor, earthRadiiToKm, isInHabitableZone } from '../utils/planetSizeCalculations';
import './PlanetInfoPanel.css';

// Original fields from KOI_cleaned.csv for more details
interface PlanetData {
  id: string;
  name: string;
  radius: number;          // Dal backend per compatibilità frontend
  period: number;          // Dal backend per compatibilità frontend
  eq_temp: number;         // Dal backend per compatibilità frontend
  // Campi originali dal KOI_cleaned.csv per maggiori dettagli
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
        <h2>{planet.name}</h2>
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
      
      {onCompareWithEarth && (
        <button onClick={onCompareWithEarth} className="compare-btn">
          🌍 Confronta con la Terra
        </button>
      )}
    </div>
  );
};

export default PlanetInfoPanel;