// Analytics.js - Página de analítica financiera con datos reales
// Eliminada la sección de distribución por billetera y resumen por billetera

import React, { useState, useEffect } from 'react';
import { getUserTransactions } from '../../API/analytics';
import { getCurrentUser } from '../../API/auth';
import IncomeExpenseChart from './charts/IncomeExpenseChart';
import FrequencyChart from './charts/FrequencyChart';
import './Analytics.css';

const Analytics = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    averageAmount: 0,
    previousTotalTransactions: 0,
    previousTotalAmount: 0,
    previousAverageAmount: 0
  });
  
  const [frequencyData, setFrequencyData] = useState({ months: [], transactions: [] });
  const [weeklyData, setWeeklyData] = useState({ weeks: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], incomes: [0, 0, 0, 0], expenses: [0, 0, 0, 0] });
  const [transactions, setTransactions] = useState([]);
  
  const userId = user?.id || getCurrentUser()?.id;
  
  // Cargar todas las transacciones del usuario
  const loadTransactions = async () => {
    const result = await getUserTransactions(userId);
    if (result.success && result.data) {
      setTransactions(result.data);
      return result.data;
    }
    return [];
  };
  
  // Calcular estadísticas principales
  const calculateStats = (transactionsData) => {
    const total = transactionsData.reduce((sum, t) => sum + t.amount, 0);
    const avg = transactionsData.length > 0 ? total / transactionsData.length : 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const currentMonthTransactions = transactionsData.filter(t => {
      const date = new Date(t.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const lastMonthTransactions = transactionsData.filter(t => {
      const date = new Date(t.createdAt);
      return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
    });
    
    const currentTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastTotal = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const currentCount = currentMonthTransactions.length;
    const lastCount = lastMonthTransactions.length;
    
    setStats({
      totalTransactions: transactionsData.length,
      totalAmount: total,
      averageAmount: avg,
      previousTotalTransactions: lastCount,
      previousTotalAmount: lastTotal,
      previousAverageAmount: lastCount > 0 ? lastTotal / lastCount : 0
    });
  };
  
  // Calcular datos para gráfico semanal (ingresos vs egresos)
  const calculateWeeklyData = (transactionsData) => {
    const weeks = ['Sem 4', 'Sem 3', 'Sem 2', 'Sem 1'];
    const incomes = [0, 0, 0, 0];
    const expenses = [0, 0, 0, 0];
    const now = new Date();
    
    transactionsData.forEach(t => {
      const date = new Date(t.createdAt);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);
      
      if (weekIndex >= 0 && weekIndex < 4) {
        if (t.type === 'RECHARGE') {
          incomes[weekIndex] += t.amount;
        } else if (t.type === 'WITHDRAWAL') {
          expenses[weekIndex] += t.amount;
        } else if (t.type === 'TRANSFER') {
          if (t.sourceWallet === t.userId) expenses[weekIndex] += t.amount;
          if (t.targetWallet) incomes[weekIndex] += t.amount;
        }
      }
    });
    
    setWeeklyData({ weeks: weeks, incomes: incomes, expenses: expenses });
  };
  
  // Calcular datos para gráfico de frecuencia mensual
  const calculateFrequencyData = (transactionsData) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyCount = new Array(12).fill(0);
    
    transactionsData.forEach(t => {
      const date = new Date(t.createdAt);
      const month = date.getMonth();
      monthlyCount[month]++;
    });
    
    setFrequencyData({
      months: months,
      transactions: monthlyCount
    });
  };
  
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      const transactionsData = await loadTransactions();
      
      if (transactionsData.length > 0) {
        calculateStats(transactionsData);
        calculateWeeklyData(transactionsData);
        calculateFrequencyData(transactionsData);
      }
      
      setLoading(false);
    };
    
    if (userId) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [userId, timeRange]);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
  };
  
  const transactionChange = stats.totalTransactions > 0 && stats.previousTotalTransactions > 0
    ? ((stats.totalTransactions - stats.previousTotalTransactions) / stats.previousTotalTransactions * 100).toFixed(1)
    : 0;
  const amountChange = stats.totalAmount > 0 && stats.previousTotalAmount > 0
    ? ((stats.totalAmount - stats.previousTotalAmount) / stats.previousTotalAmount * 100).toFixed(1)
    : 0;
  const averageChange = stats.averageAmount > 0 && stats.previousAverageAmount > 0
    ? ((stats.averageAmount - stats.previousAverageAmount) / stats.previousAverageAmount * 100).toFixed(1)
    : 0;
  
  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-container-analytics">
          <div className="loading-spinner-small"></div>
          <p>Cargando analítica...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Analítica</h1>
          <p>Visualiza tus patrones financieros</p>
        </div>
        <div className="time-range-selector">
          <button className={`range-btn ${timeRange === '6months' ? 'active' : ''}`} onClick={() => setTimeRange('6months')}>Últimos 6 meses</button>
          <button className={`range-btn ${timeRange === '12months' ? 'active' : ''}`} onClick={() => setTimeRange('12months')}>Último año</button>
        </div>
      </div>
      
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
      </div>
      
      {stats.totalTransactions === 0 && (
        <div className="empty-analytics">
          <p>No hay transacciones registradas</p>
          <span>Realiza tu primera recarga o transferencia para ver datos aquí</span>
        </div>
      )}
    </div>
  );
};

export default Analytics;