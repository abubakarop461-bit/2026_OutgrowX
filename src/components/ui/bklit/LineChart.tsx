import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    fillColor?: string;
    borderWidth?: number;
  }[];
  height?: number | string;
  tooltipPrefix?: string;
  tooltipSuffix?: string;
  valueFormatter?: (val: number) => string;
}

/**
 * BKLIT UI Line Chart Component
 * Smooth, glowing multi-dataset line & area chart with customizable tooltips and dark grid styling
 */
export const LineChart: React.FC<LineChartProps> = ({
  labels,
  datasets,
  height = '100%',
  tooltipPrefix = '₹',
  tooltipSuffix = '',
  valueFormatter,
}) => {
  const chartData = {
    labels,
    datasets: datasets.map(ds => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color || '#A8FF3E',
      backgroundColor: ds.fillColor || 'rgba(168,255,62,0.08)',
      fill: true,
      tension: 0.4,
      borderWidth: ds.borderWidth || 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: ds.color || '#A8FF3E',
    }))
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(10, 18, 13, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#ECF2EE',
        bodyColor: '#7A9484',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const v = context.parsed.y;
            if (v == null) return '';
            const formatted = valueFormatter ? valueFormatter(v) : `${tooltipPrefix}${(v / 100000).toFixed(1)}L${tooltipSuffix}`;
            return ` ${context.dataset.label}: ${formatted}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#4A6055', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: '#4A6055',
          font: { size: 10 },
          callback: (v) => valueFormatter ? valueFormatter(Number(v)) : `${tooltipPrefix}${(Number(v) / 100000).toFixed(0)}L`
        }
      }
    }
  };

  return (
    <div className="bklit-line-chart" style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
