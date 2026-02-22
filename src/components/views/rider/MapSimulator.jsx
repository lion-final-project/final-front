import React from 'react';

const MapSimulator = ({ status }) => {
  return (
    <div style={{
      height: '160px',
      background: '#0f172a',
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid #334155'
    }}>
      {/* Grid Pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Route Path */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M 40 40 L 120 40 L 120 120 L 300 120" stroke="#334155" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path
          d="M 40 40 L 120 40 L 120 120 L 300 120"
          stroke="var(--primary)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="400"
          strokeDashoffset={status === 'accepted' ? '400' : status === 'pickup' ? '300' : status === 'delivering' ? '150' : '0'}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>

      {/* Pulsing Dot Store */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', width: '16px', height: '16px' }}>
        <div className="pulse-primary" style={{ position: 'absolute', inset: -8, borderRadius: '50%', backgroundColor: 'var(--primary)', opacity: 0.4 }}></div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid white' }}></div>
        <div style={{ position: 'absolute', top: -20, left: -20, whiteSpace: 'nowrap', fontSize: '10px', fontWeight: '800', color: 'white' }}>매장 (PICKUP)</div>
      </div>

      {/* Pulsing Dot Destination */}
      <div style={{ position: 'absolute', bottom: '32px', right: '32px', width: '16px', height: '16px' }}>
        <div className="pulse-sapphire" style={{ position: 'absolute', inset: -8, borderRadius: '50%', backgroundColor: '#38bdf8', opacity: 0.4 }}></div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: '#38bdf8', border: '2px solid white' }}></div>
        <div style={{ position: 'absolute', bottom: -20, right: -20, whiteSpace: 'nowrap', fontSize: '10px', fontWeight: '800', color: 'white' }}>배송지 (DEST)</div>
      </div>

      {/* Rider Icon */}
      <div style={{
        position: 'absolute',
        transition: 'all 1s ease',
        ...status === 'accepted' ? { top: '32px', left: '32px' }
          : status === 'pickup' ? { top: '32px', left: '112px' }
            : status === 'delivering' ? { top: '112px', left: '112px' }
              : { top: '112px', left: '292px' },
        fontSize: '24px',
        zIndex: 10,
        transform: 'translate(-50%, -50%)'
      }}>
        🚲
      </div>
    </div>
  );
};

export default MapSimulator;
