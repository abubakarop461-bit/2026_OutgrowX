import React, { useEffect, useState } from 'react';

export interface GaugeChartProps {
  value: number; // 0 to 100
  min?: number;
  max?: number;
  label?: string;
  sublabel?: string;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  showValue?: boolean;
}

/**
 * BKLIT UI Gauge Chart Component
 * Responsive SVG radial arc gauge with animated indicator and glow
 */
export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  label = 'Solar Score',
  sublabel = '/100 overall',
  size = 130,
  thickness = 10,
  color = '#A8FF3E',
  trackColor = 'rgba(255,255,255,0.06)',
  showValue = true,
}) => {
  const [animatedVal, setAnimatedVal] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const duration = 1200;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedVal(Math.round(min + (value - min) * easeOut));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, min]);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle / 240-degree arc
  const arcAngle = 240; // degrees
  const arcLength = (arcAngle / 360) * circumference;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, animatedVal))) / 100;
  const rotation = 150; // Align starting point at 150 degrees (bottom-left)

  return (
    <div
      className="bklit-gauge-chart"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: `${size}px`,
        margin: '0 auto',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: `rotate(${rotation}deg)`, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="bklit-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="60%" stopColor="#A8FF3E" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="bklit-gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />

        {/* Value Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#bklit-gauge-gradient)"
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#bklit-gauge-glow)"
          style={{ transition: 'stroke-dashoffset 80ms linear' }}
        />
      </svg>

      {/* Value Overlay */}
      {showValue && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -45%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: color,
              lineHeight: 1,
            }}
          >
            {animatedVal}
          </div>
          {sublabel && (
            <div style={{ fontSize: '0.625rem', color: '#7A9484', marginTop: '2px', fontWeight: 600 }}>
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GaugeChart;
