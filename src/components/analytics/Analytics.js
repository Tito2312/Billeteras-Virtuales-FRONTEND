// Analytics.js - Página de analítica financiera
// Visualiza patrones de transacciones con gráficos interactivos

import React, { useState } from 'react';
import IncomeExpenseChart from './charts/IncomeExpenseChart';
import FrequencyChart from './charts/FrequencyChart';
import WalletDistributionChart from './charts/WalletDistributionChart';
import './Analytics.css';

const Analytics = ({ user }) => {
  const [timeRange, setTimeRange] = useState('6months');
  
  // Datos estadísticos principales
  const stats = {
    totalTransactions: 402,
    totalAmount: 87450,
    averageAmount: 217,
    previousTotalTransactions: 340,
    previousTotalAmount: 70500,
    previousAverageAmount: 224
  };
  
  // Datos para el gráfico de distribución por billetera
  const walletDistribution = [
    { name: 'Principal', amount: 41700, percentage: 47.8, color: '#7c3aed' },
    { name: 'Inversiones', amount: 25600, percentage: 29.3, color: '#a855f7' },
    { name: 'Ahorros', amount: 14700, percentage: 16.8, color: '#c4b5fd' },
    { name: 'Gastos', amount: 5450, percentage: 6.1, color: '#e9d5ff' }
  ];
  
  // Datos para el gráfico de frecuencia
  const frequencyData = {
    months: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
    transactions: [0, 20, 40, 60, 80, 100, 120]
  };
  
  // Datos para el gráfico de ingresos vs egresos
  const weeklyData = {
    weeks: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    incomes: [5200, 4800, 6200, 5800],
    expenses: [1600, 1700, 1800, 2000]
  };
  
  const transactionChange = ((stats.totalTransactions - stats.previousTotalTransactions) / stats.previousTotalTransactions * 100).toFixed(1);
  const amountChange = ((stats.totalAmount - stats.previousTotalAmount) / stats.previousTotalAmount * 100).toFixed(1);
  const averageChange = ((stats.averageAmount - stats.previousAverageAmount) / stats.previousAverageAmount * 100).toFixed(1);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };
  
  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Analítica</h1>
          <p>Visualiza tus patrones financieros</p>
        </div>
        <div className="time-range-selector">
          <button 
            className={`range-btn ${timeRange === '6months' ? 'active' : ''}`}
            onClick={() => setTimeRange('6months')}
          >
            Últimos 6 meses
          </button>
          <button 
            className={`range-btn ${timeRange === '12months' ? 'active' : ''}`}
            onClick={() => setTimeRange('12months')}
          >
            Último año
          </button>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="stats-grid-analytics">
        <div className="stat-card-analytics">
          <div className="stat-icon-analytics">📊</div>
          <div className="stat-info-analytics">
            <h3>Total Transacciones</h3>
            <p className="stat-number">{formatNumber(stats.totalTransactions)}</p>
            <span className={`stat-change ${transactionChange >= 0 ? 'positive' : 'negative'}`}>
              {transactionChange >= 0 ? '▲' : '▼'} {Math.abs(transactionChange)}% vs mes anterior
            </span>
          </div>
        </div>
        
        <div className="stat-card-analytics">
          <div className="stat-icon-analytics">💰</div>
          <div className="stat-info-analytics">
            <h3>Dinero Movilizado</h3>
            <p className="stat-number">{formatCurrency(stats.totalAmount)}</p>
            <span className={`stat-change ${amountChange >= 0 ? 'positive' : 'negative'}`}>
              {amountChange >= 0 ? '▲' : '▼'} {Math.abs(amountChange)}% vs mes anterior
            </span>
          </div>
        </div>
        
        <div className="stat-card-analytics">
          <div className="stat-icon-analytics">📈</div>
          <div className="stat-info-analytics">
            <h3>Promedio por Transacción</h3>
            <p className="stat-number">{formatCurrency(stats.averageAmount)}</p>
            <span className={`stat-change ${averageChange >= 0 ? 'positive' : 'negative'}`}>
              {averageChange >= 0 ? '▲' : '▼'} {Math.abs(averageChange)}% vs mes anterior
            </span>
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Ingresos vs Egresos</h2>
            <span className="chart-subtitle">Últimas 4 semanas</span>
          </div>
          <div className="chart-container">
            <IncomeExpenseChart data={weeklyData} />
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-header">
            <h2>Frecuencia de Transacciones</h2>
            <span className="chart-subtitle">Evolución mensual</span>
          </div>
          <div className="chart-container">
            <FrequencyChart data={frequencyData} />
          </div>
        </div>
        
        <div className="chart-card full-width">
          <div className="chart-header">
            <h2>Distribución por Billetera</h2>
            <span className="chart-subtitle">Porcentaje del total</span>
          </div>
          <div className="distribution-container">
            <div className="donut-container">
              <WalletDistributionChart data={walletDistribution} />
            </div>
            <div className="wallet-legend">
              {walletDistribution.map((wallet, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: wallet.color }}></span>
                  <span className="legend-name">{wallet.name}</span>
                  <span className="legend-percentage">{wallet.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabla resumen */}
      <div className="summary-table">
        <h2>Resumen por Billetera</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Billetera</th>
                <th>Monto Movilizado</th>
                <th>Participación</th>
                <th>Transacciones</th>
              </tr>
            </thead>
            <tbody>
              {walletDistribution.map((wallet, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="wallet-badge" style={{ backgroundColor: wallet.color }}></span>
                    {wallet.name}
                  </td>
                  <td>{formatCurrency(wallet.amount)}</td>
                  <td>
                    <div className="percentage-bar">
                      <div className="percentage-fill" style={{ width: `${wallet.percentage}%`, backgroundColor: wallet.color }}></div>
                      <span>{wallet.percentage}%</span>
                    </div>
                  </td>
                  <td>{Math.round(wallet.amount / stats.averageAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;