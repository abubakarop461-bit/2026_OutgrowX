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
const DAYLIGHT_HOURS = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

/**
 * Ventriloc UI Heatmap Chart Component
 * Daylight solar irradiance grid with dynamic color scaling
 */
export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  xLabels = DEFAULT_MONTHS.map(m => m[0]),
  yLabels,
  unit = 'kWh/m²',
  maxVal = 5.5,
  activeColor = 'rgba(255, 104, 44,',
}) => {
  // If full 24-hour grid is provided, slice to sunlight hours (6:00 to 18:00)
  const displayData = data.length === 24 ? data.slice(6, 19) : data;
  const displayYLabels = yLabels || (data.length === 24 ? DAYLIGHT_HOURS : Array.from({ length: displayData.length }, (_, i) => `${i + 6}:00`));

  return (
    <div className="bklit-heatmap-chart" style={{ width: '100%', overflowX: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `42px repeat(${xLabels.length}, 1fr)`,
          gap: '3px',
          alignItems: 'center',
        }}
      >
        {/* Header row (Months) */}
        <div />
        {xLabels.map((xl, i) => (
          <div
            key={i}
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-slate)',
              fontWeight: 500,
              textAlign: 'center',
              paddingBottom: '4px',
            }}
          >
            {xl}
          </div>
        ))}

        {/* Data rows (Hours) */}
        {displayData.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            <div
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-slate)',
                textAlign: 'right',
                paddingRight: '6px',
                lineHeight: 1,
              }}
            >
              {displayYLabels[rIdx]}
            </div>

            {row.map((intensity, cIdx) => {
              const actualVal = (intensity * maxVal).toFixed(1);
              const opacity = intensity > 0 ? Math.min(1, Math.max(0.15, intensity)) : 0;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{
                    height: '11px',
                    borderRadius: '2px',
                    background: intensity > 0 ? `${activeColor} ${opacity})` : 'var(--color-fog)',
                    border: '1px solid rgba(0,0,0,0.03)',
                    transition: 'transform 100ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)';
                    (e.currentTarget as HTMLElement).style.zIndex = '10';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLElement).style.zIndex = '1';
                  }}
                  title={`${DEFAULT_MONTHS[cIdx]} ${displayYLabels[rIdx]} — ${actualVal} ${unit}`}
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
