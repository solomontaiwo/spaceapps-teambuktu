import React from 'react';
import { PLANET_TYPE_COLORS, PLANET_TYPE_LABELS } from '../utils/planetInfo';
import './PlanetInfoPanel.css';

interface PlanetInfoPanelProps {
  planet: any;
  classification: any;
  onCompareWithEarth?: () => void;
  onClose?: () => void;
}

const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = ({
  planet,
  classification,
  onCompareWithEarth,
  onClose
}) => {
  const temp = planet.eq_temp || planet.koi_teq || 300;
  const radius = planet.radius || planet.koi_prad || 1;
  const isHabitable = temp >= 273 && temp <= 320 && radius < 3;
  
  return (
    <div className="planet-info-panel">
      <div className="planet-header">
        <h2>{planet.name}</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="planet-type">
        <div 
          className="type-badge"
          style={{ 
            backgroundColor: PLANET_TYPE_COLORS[classification.type as keyof typeof PLANET_TYPE_COLORS] || '#666'
          }}
        >
          {PLANET_TYPE_LABELS[classification.type as keyof typeof PLANET_TYPE_LABELS] || 'Sconosciuto'}
        </div>
      </div>
      
      <div className="planet-stats">
        <div className="stat">
          <span className="label">🌡️ Temperatura:</span>
          <span className="value">{temp.toFixed(0)}K ({(temp - 273).toFixed(0)}°C)</span>
        </div>
        
        <div className="stat">
          <span className="label">📏 Dimensioni:</span>
          <span className="value">{radius.toFixed(1)}× Terra</span>
        </div>
        
        <div className="stat">
          <span className="label">🌍 Abitabilità:</span>
          <span className={`value ${isHabitable ? 'habitable' : 'not-habitable'}`}>
            {isHabitable ? '✅ Zona Abitabile' : '❌ Non Abitabile'}
          </span>
        </div>
        
        {planet.period && (
          <div className="stat">
            <span className="label">🗓️ Periodo Orbitale:</span>
            <span className="value">{planet.period.toFixed(1)} giorni</span>
          </div>
        )}
        
        {planet.star_temp && (
          <div className="stat">
            <span className="label">⭐ Temperatura Stella:</span>
            <span className="value">{planet.star_temp.toFixed(0)}K</span>
          </div>
        )}
      </div>
      
      <div className="planet-description">
        <h3>Caratteristiche Scientifiche:</h3>
        <ul>
          {classification.type === 'rocky' && (
            <>
              <li>🪨 Superficie solida con possibili montagne e crateri</li>
              <li>🏔️ Atmosfera sottile o assente</li>
              <li>🌋 Possibile attività geologica</li>
            </>
          )}
          
          {classification.type === 'gaseous' && (
            <>
              <li>🌪️ Atmosfera densa di idrogeno ed elio</li>
              <li>🌀 Tempeste atmosferiche gigantesche</li>
              <li>💨 Possibili lune rocciose o ghiacciate</li>
            </>
          )}
          
          {classification.type === 'icy' && (
            <>
              <li>❄️ Superficie coperta di ghiacci</li>
              <li>💎 Alta riflettività (albedo elevato)</li>
              <li>🧊 Possibili oceani sotterranei</li>
            </>
          )}
          
          {classification.type === 'volcanic' && (
            <>
              <li>🌋 Intensa attività vulcanica</li>
              <li>🔥 Superficie incandescente</li>
              <li>💨 Atmosfera ricca di gas sulfurei</li>
            </>
          )}
          
          {classification.type === 'oceanic' && (
            <>
              <li>🌊 Oceani di acqua liquida</li>
              <li>☁️ Ciclo dell'acqua attivo</li>
              <li>🐠 Alto potenziale per la vita</li>
            </>
          )}
        </ul>
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