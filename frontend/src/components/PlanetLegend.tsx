import React from 'react';

export default function PlanetLegend() {
  const planetTypes = [
    { 
      type: 'CANDIDATE', 
      color: '#ffffff', 
      description: 'Found by Team Buktu - To Check',
      special: true,
      icon: '🔍'
    },
    { 
      type: 'CONFIRMED', 
      color: '#4169e1', 
      description: 'Confirmed exoplanets',
      icon: '✅'
    },
    { 
      type: 'FALSE POSITIVE', 
      color: '#666666', 
      description: 'Not real planets',
      icon: '❌'
    },
    { 
      type: 'Icy Worlds', 
      color: '#87ceeb', 
      description: 'Cold planets (<200K)',
      icon: '❄️'
    },
    { 
      type: 'Volcanic', 
      color: '#8b0000', 
      description: 'Hot lava worlds (>800K)',
      icon: '🌋'
    },
    { 
      type: 'Gas Giants', 
      color: '#dda0dd', 
      description: 'Large gaseous planets',
      icon: '🪐'
    },
    { 
      type: 'Ocean Worlds', 
      color: '#006994', 
      description: 'Potentially habitable',
      icon: '🌊'
    },
    { 
      type: 'Rocky Planets', 
      color: '#cd853f', 
      description: 'Earth-like composition',
      icon: '🪨'
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      left: 20,
      top: 120, // Sotto la barra di ricerca
      background: 'rgba(0, 0, 20, 0.92)',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      fontSize: '13px',
      fontFamily: 'monospace',
      zIndex: 1000,
      maxWidth: '320px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '16px', 
        fontWeight: 'bold',
        borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '8px',
        textAlign: 'center',
        background: 'linear-gradient(90deg, #4169e1, #9370db)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🪐 Planet Classification
      </h4>
      
      <div style={{ display: 'grid', gap: '8px' }}>
        {planetTypes.map((planet, index) => (
          <div 
            key={index}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '6px 8px',
              borderRadius: '8px',
              background: planet.special ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: planet.special ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '16px', minWidth: '20px' }}>
              {planet.icon}
            </div>
            
            <div 
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: planet.color,
                border: planet.special ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.3)',
                flexShrink: 0,
                boxShadow: planet.special ? '0 0 12px rgba(255, 255, 255, 0.6)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
                animation: planet.special ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: planet.special ? 'bold' : '600',
                color: planet.special ? '#ffffff' : '#e0e0e0',
                fontSize: planet.special ? '14px' : '13px'
              }}>
                {planet.type}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: planet.special ? '#f0f0f0' : '#b0b0b0',
                fontStyle: planet.special ? 'italic' : 'normal',
                marginTop: '2px'
              }}>
                {planet.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#888888',
          marginBottom: '4px'
        }}>
          🚀 Team Buktu - NASA Space Apps 2024
        </div>
        <div style={{
          fontSize: '10px',
          color: '#666666'
        }}>
          Real exoplanet data from Kepler mission
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 0 12px rgba(255, 255, 255, 0.6) !important;
            transform: scale(1) !important;
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.9) !important;
            transform: scale(1.05) !important;
          }
        }
        `
      }} />
    </div>
  );
}