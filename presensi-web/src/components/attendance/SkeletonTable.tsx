import React from 'react';

export const SkeletonTable: React.FC = () => {
  return (
    <div className="glass-panel animate-pulse" style={{ padding: '1.25rem', borderColor: 'rgba(228,228,231,0.08)' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '150px', height: '18px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 130px', height: '38px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
          <div style={{ flex: '2 1 180px', height: '38px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
          <div style={{ width: '160px', height: '38px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
        </div>
      </div>

      {/* Row Skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            {/* Avatar & Name Skeleton */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ width: '120px', height: '14px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }} />
                  <div style={{ width: '80px', height: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px' }} />
                </div>
              </div>
              <div style={{ width: '70px', height: '22px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px' }} />
            </div>

            {/* Grid Skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[1, 2, 3].map((j) => (
                <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ width: '40px', height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }} />
                  <div style={{ width: '55px', height: '13px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
