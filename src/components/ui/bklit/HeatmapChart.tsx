import React from 'react';

export interface HeatmapChartProps {
  data: number[][]; // grid[row][col] where values are 0..1 or absolute
  xLabels?: string[];
  yLabels?: string[];
  unit?: string;
  maxVal?: number;
  activeColor?: string;
}

const DEFAULT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * BKLIT UI Heatmap Chart Component
 * High-performance grid heatmap with dynamic color scaling and interactive cell tooltips
 */
export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  xLabels = DEFAULT_MONTHS.map(m => m[0]),
  yLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`),
  unit = 'kWh/m²',
  maxVal = 5.5,
  activeColor = 'rgba(168, 255, 62,',
}) => {
  return (
    <div className="bklit-heatmap-chart" style={{ width: '100%', overflowX: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `36px repeat(${xLabels.length}, 1fr)`,
          gap: '2px',
          alignItems: 'center',
        }}
      >
        {/* Header row */}
        <div />
        {xLabels.map((xl, i) => (
          <div
            key={i}
            style={{
              fontSize: '0.625rem',
              color: '#7A9484',
              fontWeight: 700,
              textAlign: 'center',
              paddingBottom: '2px',
            }}
          >
            {xl}
          </div>
        ))}

        {/* Data rows */}
        {data.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            <div
              style={{
                fontSize: '0.625rem',
                color: '#4A6055',
                textAlign: 'right',
                paddingRight: '6px',
                lineHeight: 1,
              }}
            >
              {yLabels[rIdx] || `${rIdx}:00`}
            </div>

            {row.map((intensity, cIdx) => {
              const actualVal = (intensity * maxVal).toFixed(1);
              const opacity = intensity > 0 ? Math.min(0.9, Math.max(0.12, intensity * 0.85)) : 0.02;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{
                    height: '11px',
                    borderRadius: '2px',
                    background: intensity > 0 ? `${activeColor} ${opacity})` : 'rgba(255,255,255,0.02)',
                    transition: 'transform 100ms ease, background-color 100ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.3)';
                    (e.currentTarget as HTMLElement).style.zIndex = '10';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLElement).style.zIndex = '1';
                  }}
                  title={`${DEFAULT_MONTHS[cIdx]} ${yLabels[rIdx] || `${rIdx}:00`} — ${actualVal} ${unit}`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HeatmapChart;
