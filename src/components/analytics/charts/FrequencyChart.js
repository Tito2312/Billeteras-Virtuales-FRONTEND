import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const FrequencyChart = ({ data }) => {
  const chartData = {
    labels: data.months,
    datasets: [{
      label: 'Transacciones',
      data: data.transactions,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#7c3aed',
      pointBorderColor: 'white',
      pointBorderWidth: 2,
      pointRadius: 4,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `📊 ${ctx.raw} transacciones` } } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 20 } } }
  };

  return <Line data={chartData} options={options} />;
};

export default FrequencyChart;