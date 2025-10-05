import React from 'react';

export default function PlanetLegend() {
  const planetTypes = [
    { 
      type: 'CANDIDATE', 
      color: '#ffffff', 
      description: 'CANDIDATE FINDED BY TEAM BUKTU',
      special: true,
      icon: '🔍'
    },
    { 
      type: 'CONFIRMED', 
      color: '#4169e1', 
      description: 'Confirmed Exoplanets',
      icon: '✅'
    },
    { 
      type: 'FALSE POSITIVE', 
      color: '#666666', 
      description: 'Not Real Planets',
      icon: '❌'
    },
    { 
      type: 'Icy Worlds', 
      color: '#87ceeb', 
      description: 'Cold Planets',
      icon: '❄️'
    },
    { 
      type: 'Volcanic', 
      color: '#8b0000', 
      description: 'Hot Lava Worlds',
      icon: '🌋'
    },
    { 
      type: 'Gas Giants', 
      color: '#dda0dd', 
      description: 'Gaseous Planets',
      icon: '🪐'
    },
    { 
      type: 'Ocean Worlds', 
      color: '#006994', 
      description: 'Potentially Habitable',
      icon: '🌊'
    },
    { 
      type: 'Rocky Planets', 
      color: '#cd853f', 
      description: 'Earth-like',
      icon: '🪨'
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      left: 20,
      top: 80, // Più vicino alla barra di ricerca
      background: 'rgba(0, 0, 20, 0.95)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      maxWidth: '280px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
    }}>
      <h4 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '14px', 
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        🪐 Planet Colors
      </h4>
      
      <div style={{ display: 'grid', gap: '4px' }}>
        {planetTypes.map((planet, index) => (
          <div 
            key={index}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '4px 6px',
              borderRadius: '6px',
              background: planet.special ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: planet.special ? '1px solid rgba(255, 255, 255, 0.4)' : 'none'
            }}
          >
            <div style={{ fontSize: '14px', minWidth: '16px' }}>
              {planet.icon}
            </div>
            
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: planet.color,
                border: planet.special ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.3)',
                flexShrink: 0,
                boxShadow: planet.special ? '0 0 8px rgba(255, 255, 255, 0.8)' : 'none'
              }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: planet.special ? 'bold' : '600',
                color: planet.special ? '#ffffff' : '#e0e0e0',
                fontSize: planet.special ? '13px' : '12px'
              }}>
                {planet.type}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: planet.special ? '#f0f0f0' : '#b0b0b0',
                fontStyle: planet.special ? 'italic' : 'normal'
              }}>
                {planet.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '8px',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        fontSize: '9px',
        color: '#888888'
      }}>
        🚀 NASA Space Apps 2024 - Team Buktu
      </div>
    </div>
  );
}