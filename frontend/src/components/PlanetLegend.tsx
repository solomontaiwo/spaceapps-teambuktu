import React, { useState } from 'react';

type PlanetLegendProps = {
  hidden?: boolean;
};

export default function PlanetLegend({ hidden = false }: PlanetLegendProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const planetTypes = [
    { 
      type: 'CANDIDATE', 
      color: '#ffffff', 
      description: 'FOUND BY TEAM BUKTU',
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
      description: 'Not Real Exoplanets',
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div style={{
      position: 'absolute',
      // Sempre in basso a destra, sia su desktop che mobile
      right: '10px',
      bottom: '10px',
      zIndex: 1000,
      opacity: hidden ? 0 : 1,
      visibility: hidden ? 'hidden' : 'visible',
      transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
      pointerEvents: hidden ? 'none' : 'auto',
    }}>
      {/* 🎯 BOTTONE LEGENDA */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: isMobile ? '8px 10px' : '8px 12px',
          background: 'linear-gradient(135deg, rgba(75, 0, 130, 0.9), rgba(138, 43, 226, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          color: 'white',
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: '600',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '4px' : '6px',
          transition: 'all 0.2s ease',
          minWidth: 'fit-content'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        }}
      >
        <span>🪐</span>
        <span style={{ 
          fontSize: '13px',
          display: window.innerWidth < 768 ? 'none' : 'inline' // Nasconde testo su mobile
        }}>
          Planet Colors
        </span>
        <span style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          fontSize: '12px'
        }}>
          ▼
        </span>
      </button>

      {/* 🎨 PANNELLO LEGENDA (COLLASSABILE) */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          // Sempre si apre verso l'alto da destra
          bottom: '50px',
          right: '0',
          background: 'rgba(0, 0, 20, 0.95)',
          color: 'white',
          padding: isMobile ? '10px' : '12px',
          borderRadius: '8px',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: isMobile ? '11px' : '12px',
          fontFamily: 'monospace',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          maxWidth: isMobile ? 'calc(100vw - 40px)' : '320px',
          minWidth: isMobile ? 'auto' : '250px',
          maxHeight: isMobile ? '50vh' : 'auto',
          overflowY: isMobile ? 'auto' : 'visible',
          animation: 'slideUp 0.3s ease'
        }}>
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            `
          }} />
          
          <h4 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '14px', 
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#ffffff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '6px'
          }}>
            🪐 Planet Classifications
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gap: '4px',
            maxHeight: window.innerWidth < 768 ? '300px' : 'auto', // Scroll su mobile
            overflowY: window.innerWidth < 768 ? 'auto' : 'visible'
          }}>
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
                  border: planet.special ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = planet.special 
                    ? 'rgba(255, 255, 255, 0.25)' 
                    : 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = planet.special 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <div style={{ fontSize: '14px', minWidth: '16px' }}>
                  {planet.icon}
                </div>
                
                <div 
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: planet.color,
                    border: planet.special ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.3)',
                    flexShrink: 0,
                    boxShadow: planet.special ? '0 0 8px rgba(255, 255, 255, 0.8)' : 'none'
                  }}
                />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: planet.special ? 'bold' : '600',
                    color: planet.special ? '#ffffff' : '#e0e0e0',
                    fontSize: planet.special ? '12px' : '11px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {planet.type}
                  </div>
                  <div style={{ 
                    fontSize: '9px', 
                    color: planet.special ? '#f0f0f0' : '#b0b0b0',
                    fontStyle: planet.special ? 'italic' : 'normal',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
            fontSize: '8px',
            color: '#888888'
          }}>
            🚀 NASA Space Apps 2025 - Team Buktu
          </div>
        </div>
      )}
    </div>
  );
}