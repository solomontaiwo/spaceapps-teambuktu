import React, { useEffect, useState } from 'react';

const GalaxyLoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('Initializing quantum sensors');

  const loadingTexts = [
    'Initializing quantum sensors',
    'Scanning distant galaxies',
    'Analyzing exoplanet data',
    'Calculating habitability zones',
    'Mapping stellar coordinates',
    'Loading 7,803 worlds'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15 + 5, 100);
        
        // Cambia il testo in base al progresso
        const textIndex = Math.floor((newProgress / 100) * loadingTexts.length);
        setCurrentText(loadingTexts[Math.min(textIndex, loadingTexts.length - 1)]);
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Stelle di sfondo animate */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(2px 2px at 20px 30px, #fff, transparent),
          radial-gradient(2px 2px at 40px 70px, #fff, transparent),
          radial-gradient(1px 1px at 90px 40px, #fff, transparent),
          radial-gradient(1px 1px at 130px 80px, #fff, transparent),
          radial-gradient(2px 2px at 160px 30px, #fff, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 3s ease-in-out infinite alternate',
        opacity: 0.8
      }} />
      
      {/* Pianeta centrale rotante */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #4a90e2, #7b68ee, #9370db)',
        boxShadow: '0 0 30px rgba(116, 104, 238, 0.5), inset -10px -10px 20px rgba(0,0,0,0.3)',
        animation: 'planetRotate 4s linear infinite',
        marginBottom: '30px',
        position: 'relative'
      }}>
        {/* Anello del pianeta */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          animation: 'ringRotate 6s linear infinite reverse'
        }} />
      </div>

      {/* Testo di caricamento dinamico */}
      <div style={{
        fontSize: '18px',
        color: '#ffffff',
        fontWeight: '300',
        letterSpacing: '1px',
        marginBottom: '10px',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        textAlign: 'center',
        minHeight: '22px'
      }}>
        {currentText}
      </div>

      {/* Percentuale di progresso */}
      <div style={{
        fontSize: '14px',
        color: '#888',
        marginBottom: '20px',
        fontFamily: '"SF Mono", Monaco, monospace'
      }}>
        {Math.floor(progress)}%
      </div>

      {/* Barra di progresso galattica con progresso reale */}
      <div style={{
        width: '300px',
        height: '3px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '20px'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #4a90e2, #7b68ee)',
          borderRadius: '3px',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 10px rgba(116, 104, 238, 0.5)'
        }} />
      </div>

      {/* Particelle orbitanti */}
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -60%)',
        pointerEvents: 'none'
      }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: '#ffffff',
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 45}deg) translateX(80px) translateY(-2px)`,
              animation: `orbit ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes planetRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes ringRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }

        @keyframes progressGlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400px); }
        }

        @keyframes twinkle {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(80px) translateY(-2px); }
          to { transform: rotate(360deg) translateX(80px) translateY(-2px); }
        }
      `}</style>
    </div>
  );
};

export default GalaxyLoadingScreen;