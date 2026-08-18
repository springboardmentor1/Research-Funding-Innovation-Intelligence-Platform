import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopicBarChart = ({ data = [] }) => {
  const labels = data.map(d => d.topic);
  const counts = data.map(d => d.count);

  const chartData = {
    labels: labels.length ? labels : ['Deep Learning', 'Quantum Cryptography', 'Solid-State Batteries', 'CRISPR', 'Solar Cells'],
    datasets: [
      {
        label: 'Paper Count',
        data: counts.length ? counts : [5, 4, 3, 3, 2],
        backgroundColor: [
          '#24527a',
          '#247291',
          '#1d7090',
          '#0e8c8c',
          '#3b82f6'
        ],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopicBarChart;
