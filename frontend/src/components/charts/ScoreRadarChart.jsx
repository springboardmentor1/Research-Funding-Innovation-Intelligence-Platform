import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const ScoreRadarChart = ({ breakdown }) => {
  const chartData = {
    labels: [
      'Research Novelty (30%)',
      'Patent Strength (20%)',
      'Tech Maturity (15%)',
      'Market Potential (20%)',
      'Funding Relevance (15%)'
    ],
    datasets: [
      {
        label: 'Factor Score',
        data: breakdown ? [
          breakdown.novelty,
          breakdown.patent_strength,
          breakdown.tech_maturity,
          breakdown.market_potential,
          breakdown.funding_relevance
        ] : [80, 65, 55, 85, 90],
        backgroundColor: 'rgba(36, 82, 122, 0.25)',
        borderColor: '#24527a',
        borderWidth: 2.5,
        pointBackgroundColor: '#247291',
        pointBorderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(36, 82, 122, 0.15)' },
        grid: { color: 'rgba(36, 82, 122, 0.15)' },
        pointLabels: { color: '#1a2530', font: { size: 11, weight: 'bold' } },
        ticks: { color: '#576574', backdropColor: 'transparent' },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="h-72 w-full">
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default ScoreRadarChart;
