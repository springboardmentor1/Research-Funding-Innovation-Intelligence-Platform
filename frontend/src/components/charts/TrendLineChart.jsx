import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendLineChart = ({ data = [] }) => {
  const labels = data.map(d => d.year);
  const counts = data.map(d => d.publication_count);

  const chartData = {
    labels: labels.length ? labels : ['2010', '2013', '2016', '2019', '2022', '2025'],
    datasets: [
      {
        label: 'Annual Scientific Publications',
        data: counts.length ? counts : [10, 25, 60, 140, 320, 750],
        borderColor: '#24527a',
        backgroundColor: 'rgba(36, 82, 122, 0.14)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#247291',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#1a2530',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#24527a',
        borderWidth: 1.5,
        titleColor: '#1a2530',
        bodyColor: '#24527a',
        titleFont: { weight: 'bold' },
        bodyFont: { weight: 'bold' },
        padding: 10,
        boxPadding: 4,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(36, 82, 122, 0.08)' },
        ticks: { color: '#576574', font: { size: 10, weight: 'bold' } }
      },
      y: {
        grid: { color: 'rgba(36, 82, 122, 0.08)' },
        ticks: { color: '#576574', font: { weight: 'bold' } }
      }
    }
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TrendLineChart;
