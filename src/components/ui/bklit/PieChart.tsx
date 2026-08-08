import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface PieChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
  cutout?: string | number;
  centerText?: string;
  centerSubtext?: string;
}

/**
 * BKLIT UI Pie/Donut Chart Component
 * Sleek donut / pie chart with inner label and legend
 */
export const PieChart: React.FC<PieChartProps> = ({
  labels,
  data,
  colors = ['rgba(168,255,62,0.85)', 'rgba(255,255,255,0.08)'],
  cutout = '72%',
  centerText,
  centerSubtext,
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      }
    ]
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: cutout as any,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10, 18, 13, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#ECF2EE',
        bodyColor: '#7A9484',
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (c) => ` ${c.label}: ${c.parsed}%`
        }
      }
    }
  };

  return (
    <div
      className="bklit-pie-chart"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pie data={chartData} options={options} />

      {(centerText || centerSubtext) && (
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {centerText && (
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#A8FF3E', lineHeight: 1 }}>
              {centerText}
            </div>
          )}
          {centerSubtext && (
            <div style={{ fontSize: '0.625rem', color: '#7A9484', marginTop: '2px', fontWeight: 600 }}>
              {centerSubtext}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PieChart;
