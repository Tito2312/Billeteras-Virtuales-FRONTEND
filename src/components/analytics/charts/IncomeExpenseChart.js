import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncomeExpenseChart = ({ data }) => {
  const chartData = {
    labels: data.weeks,
    datasets: [
      {
        label: 'Ingresos',
        data: data.incomes,
        backgroundColor: '#10b981',
        borderRadius: 8,
        barPercentage: 0.6,
      },
      {
        label: 'Egresos',
        data: data.expenses,
        backgroundColor: '#ef4444',
        borderRadius: 8,
        barPercentage: 0.6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toLocaleString('es-CO')}` } }
    },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => '$' + v.toLocaleString('es-CO') } } }
  };

  return <Bar data={chartData} options={options} />;
};

export default IncomeExpenseChart;
