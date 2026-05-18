// Rewards.js - Sistema de Recompensas y Niveles
// Según documento del proyecto - SIN historial de puntos recientes

import React, { useState, useEffect } from 'react';
import RewardsModal from './rewardsModal/RewardsModal';
import { getUserLevelInfo, getPointsRules } from '../../API/rewards';
import { getCurrentUser } from '../../API/auth';
import './Rewards.css';

const Rewards = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState('Bronce');
  const [nextLevel, setNextLevel] = useState(null);
  const [pointsToNextLevel, setPointsToNextLevel] = useState(0);
  const [benefits, setBenefits] = useState([]);
  const [allLevels, setAllLevels] = useState([]);
  
  const userId = user?.id || getCurrentUser()?.id;
  const pointsRules = getPointsRules();
  
  useEffect(() => {
    const loadRewardsData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      const levelResult = await getUserLevelInfo(userId);
      if (levelResult.success && levelResult.data) {
        setUserPoints(levelResult.data.points);
        setUserLevel(levelResult.data.level);
        setNextLevel(levelResult.data.nextLevel);
        setPointsToNextLevel(levelResult.data.pointsToNextLevel);
        setBenefits(levelResult.data.benefits);
        setAllLevels(levelResult.data.allLevels);
      }
      
      setLoading(false);
    };
    
    loadRewardsData();
  }, [userId]);
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
  };
  
  const currentLevelInfo = allLevels.find(l => l.name === userLevel);
  const nextLevelInfo = allLevels.find(l => l.name === nextLevel);
  const progressPercentage = nextLevelInfo && currentLevelInfo
    ? ((userPoints - currentLevelInfo.minPoints) / (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100
    : 100;
  
  const handleRedeem = (redemptionData) => {
    alert(`🎁 Beneficio canjeado: ${redemptionData.benefit.name}\n\nPuntos gastados: ${formatNumber(redemptionData.pointsSpent)}\n\n⚠️ Esta funcionalidad se conectará con el backend próximamente.`);
  };
  
  if (loading) {
    return (
      <div className="rewards-page">
        <div className="loading-container-rewards">
          <div className="loading-spinner-small"></div>
          <p>Cargando sistema de recompensas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <h1>Sistema de Recompensas</h1>
        <p>Gana puntos y desbloquea beneficios</p>
      </div>
      
      {/* Tarjeta de nivel actual */}
      <div className="level-card">
        <div className="level-info">
          <span className="level-label">Nivel Actual</span>
          <div className="level-name">{userLevel}</div>
          <div className="level-points">
            <span className="points-number">{formatNumber(userPoints)}</span>
            <span className="points-label">puntos</span>
          </div>
        </div>
        
        {nextLevel && (
          <div className="level-progress">
            <div className="progress-header">
              <span>Progreso a {nextLevel}</span>
              <span>{formatNumber(pointsToNextLevel)} puntos restantes</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        )}
        
        {!nextLevel && (
          <div className="max-level-badge">
            🏆 ¡Has alcanzado el nivel máximo! 🏆
          </div>
        )}
      </div>
      
      {/* Grid de dos columnas */}
      <div className="rewards-grid">
        {/* Columna izquierda: Reglas de puntos y niveles */}
        <div className="rules-section">
          <div className="section-card">
            <h2>¿Cómo ganar puntos?</h2>
            <div className="rules-list">
              {pointsRules.map((rule, idx) => (
                <div key={idx} className="rule-item">
                  <div className="rule-icon">{rule.icon}</div>
                  <div className="rule-info">
                    <span className="rule-type">{rule.type}</span>
                    <span className="rule-description">{rule.points}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="rules-note">
              <small>✨ Los puntos se acreditan automáticamente al completar cada transacción</small>
            </div>
          </div>
          
          {/* Tabla de niveles */}
          <div className="section-card">
            <h2>Niveles y Beneficios</h2>
            <div className="levels-table-container">
              <table className="levels-table">
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Puntos</th>
                    <th>Beneficios</th>
                  </tr>
                </thead>
                <tbody>
                  {allLevels.map((level, idx) => (
                    <tr key={idx} className={level.name === userLevel ? 'current-level' : ''}>
                      <td style={{ fontWeight: level.name === userLevel ? 'bold' : 'normal' }}>
                        <span className="level-badge" style={{ 
                          backgroundColor: level.color,
                          color: level.name === 'Oro' ? '#8B6914' : '#1e1b4b',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {level.name}
                        </span>
                      </td>
                      <td>
                        {level.minPoints.toLocaleString('es-CO')}
                        {level.maxPoints !== Infinity ? ` - ${level.maxPoints.toLocaleString('es-CO')}` : '+'}
                      </td>
                      <td>
                        <ul className="benefits-list">
                          {level.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Columna derecha: Beneficios destacados y canje */}
        <div className="activity-section">
          <div className="section-card">
            <div className="section-header">
              <h2>Beneficios Destacados</h2>
              <button className="btn-redeem-points" onClick={() => setShowRedeemModal(true)}>
                Canjear puntos →
              </button>
            </div>
            <div className="benefits-showcase">
              <div className="benefit-item">
                <div className="benefit-icon">💰</div>
                <div className="benefit-info">
                  <span className="benefit-title">Reducción de comisiones</span>
                  <span className="benefit-desc">Menos comisiones por transacción</span>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">⚡</div>
                <div className="benefit-info">
                  <span className="benefit-title">Prioridad</span>
                  <span className="benefit-desc">Transacciones más rápidas</span>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🎁</div>
                <div className="benefit-info">
                  <span className="benefit-title">Bonos de puntos</span>
                  <span className="benefit-desc">Gana puntos más rápido</span>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💎</div>
                <div className="benefit-info">
                  <span className="benefit-title">Límites aumentados</span>
                  <span className="benefit-desc">Mayores límites de transacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de canje de beneficios */}
      <RewardsModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onRedeem={handleRedeem}
        userPoints={userPoints}
        userLevel={userLevel}
      />
    </div>
  );
};

export default Rewards;