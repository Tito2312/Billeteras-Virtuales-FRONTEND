import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const WalletDistributionChart = ({ data }) => {
  const chartData = {
    labels: data.map(w => w.name),
    datasets: [{
      data: data.map(w => w.percentage),
      backgroundColor: data.map(w => w.color),
      borderColor: 'white',
      borderWidth: 3,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}% del total` } } }
  };

  return <Doughnut data={chartData} options={options} />;
};

export default WalletDistributionChart;
