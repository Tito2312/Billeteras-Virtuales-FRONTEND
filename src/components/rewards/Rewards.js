// Rewards.js - Sistema de Recompensas y Niveles
// Según documento: puntos por transacciones, niveles y beneficios

import React, { useState } from 'react';
import RewardsModal from './RewardsModal';
import './Rewards.css';

const Rewards = ({ user }) => {
  // Estados para el modal
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  
  // Datos del usuario (simulados por ahora, después vendrán del backend)
  const [userPoints, setUserPoints] = useState(12450);
  const [userLevel, setUserLevel] = useState('Oro');
  
  // Historial de puntos recientes
  const recentPoints = [
    { id: 1, description: 'Recarga de $500', date: '8 Abr', points: 50, type: 'recarga' },
    { id: 2, description: 'Transferencia de $1,200', date: '7 Abr', points: 120, type: 'transferencia' },
    { id: 3, description: 'Pago a comercio', date: '6 Abr', points: 85, type: 'pago' },
    { id: 4, description: 'Transferencia de $450', date: '5 Abr', points: 45, type: 'transferencia' },
    { id: 5, description: '¡Nivel Oro alcanzado!', date: '3 Abr', points: 1000, type: 'bono' }
  ];
  
  // Definición de niveles según documento
  const levels = [
    { 
      name: 'Bronce', 
      minPoints: 0, 
      maxPoints: 500,
      color: '#cd7f32',
      bgColor: '#fdf6ec',
      benefits: [
        '1% cashback en compras',
        'Soporte básico',
        'Sin comisiones',
        'Acceso anticipado'
      ]
    },
    { 
      name: 'Plata', 
      minPoints: 501, 
      maxPoints: 1000,
      color: '#c0c0c0',
      bgColor: '#f5f5f5',
      benefits: [
        '2% cashback en compras',
        'Soporte prioritario',
        'Sin comisiones',
        'Acceso anticipado'
      ]
    },
    { 
      name: 'Oro', 
      minPoints: 1001, 
      maxPoints: 5000,
      color: '#ffd700',
      bgColor: '#fffbea',
      benefits: [
        '3% cashback en compras',
        'Soporte VIP',
        'Sin comisiones',
        'Acceso anticipado',
        'Eventos exclusivos'
      ]
    },
    { 
      name: 'Platino', 
      minPoints: 5001, 
      maxPoints: Infinity,
      color: '#e5e4e2',
      bgColor: '#f0f0f0',
      benefits: [
        '5% cashback en compras',
        'Soporte VIP 24/7',
        'Sin comisiones',
        'Acceso anticipado',
        'Eventos exclusivos',
        'Asesor financiero personal'
      ]
    }
  ];
  
  // Encontrar nivel actual
  const currentLevel = levels.find(l => userPoints >= l.minPoints && userPoints <= l.maxPoints) || levels[0];
  
  // Encontrar siguiente nivel
  const currentLevelIndex = levels.findIndex(l => l.name === currentLevel.name);
  const nextLevel = levels[currentLevelIndex + 1];
  
  // Calcular progreso al siguiente nivel
  const pointsToNextLevel = nextLevel ? nextLevel.minPoints - userPoints : 0;
  const progressPercentage = nextLevel 
    ? ((userPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;
  
  // Reglas de puntos según documento
  const pointsRules = [
    { type: 'Recarga', points: '1 punto por cada $100', icon: '📥', multiplier: 0.01 },
    { type: 'Retiro', points: '2 puntos por cada $100', icon: '📤', multiplier: 0.02 },
    { type: 'Transferencia', points: '3 puntos por cada $100', icon: '🔄', multiplier: 0.03 },
    { type: 'Pago programado', points: 'Bono adicional', icon: '⏰', multiplier: 'bono' }
  ];
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };
  
  // Manejar canje de puntos
  const handleRedeem = (redemptionData) => {
    // Restar los puntos canjeados
    const newPoints = userPoints - redemptionData.pointsSpent;
    setUserPoints(newPoints);
    
    // Verificar si cambió de nivel
    const newLevel = levels.find(l => newPoints >= l.minPoints && newPoints <= l.maxPoints) || levels[0];
    if (newLevel.name !== userLevel) {
      setUserLevel(newLevel.name);
      alert(`🎉 ¡Felicidades! Has alcanzado el nivel ${newLevel.name}`);
    }
    
    alert(`🎁 Beneficio canjeado: ${redemptionData.benefit.name}\n\nPuntos gastados: ${formatNumber(redemptionData.pointsSpent)}\n\n⚠️ Próximamente se conectará con el backend.`);
  };
  
  return (
    <div className="rewards-page">
      {/* Header */}
      <div className="rewards-header">
        <h1>Sistema de Recompensas</h1>
        <p>Gana puntos y desbloquea beneficios</p>
      </div>
      
      {/* Tarjeta de nivel actual */}
      <div className="level-card" style={{ background: `linear-gradient(135deg, ${currentLevel.bgColor} 0%, #fff 100%)`, borderBottom: `3px solid ${currentLevel.color}` }}>
        <div className="level-info">
          <span className="level-label">Nivel Actual</span>
          <div className="level-name" style={{ color: currentLevel.color }}>
            {currentLevel.name}
          </div>
          <div className="level-points">
            <span className="points-number">{formatNumber(userPoints)}</span>
            <span className="points-label">puntos</span>
          </div>
        </div>
        
        {nextLevel && (
          <div className="level-progress">
            <div className="progress-header">
              <span>Progreso a {nextLevel.name}</span>
              <span>{formatNumber(pointsToNextLevel)} puntos restantes</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercentage}%`, background: currentLevel.color }}></div>
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
                  {levels.map((level, idx) => (
                    <tr key={idx} className={level.name === currentLevel.name ? 'current-level' : ''}>
                      <td>
                        <div className="level-badge" style={{ background: level.color }}>
                          {level.name}
                        </div>
                       </td>
                      <td>
                        {level.minPoints.toLocaleString('es-CO')}
                        {level.maxPoints !== Infinity ? ` - ${level.maxPoints.toLocaleString('es-CO')}` : '+'}
                       </td>
                      <td>
                        <ul className="benefits-list">
                          {level.benefits.slice(0, 3).map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                          {level.benefits.length > 3 && (
                            <li className="more-benefits">+{level.benefits.length - 3} más</li>
                          )}
                        </ul>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Columna derecha: Puntos recientes y beneficios destacados */}
        <div className="activity-section">
          {/* Puntos recientes */}
          <div className="section-card">
            <h2>Puntos Recientes</h2>
            <div className="recent-points-list">
              {recentPoints.map(point => (
                <div key={point.id} className="recent-point-item">
                  <div className="point-info">
                    <div className="point-icon">
                      {point.type === 'recarga' && '📥'}
                      {point.type === 'transferencia' && '🔄'}
                      {point.type === 'pago' && '💳'}
                      {point.type === 'bono' && '🎁'}
                    </div>
                    <div className="point-details">
                      <span className="point-description">{point.description}</span>
                      <span className="point-date">{point.date}</span>
                    </div>
                  </div>
                  <div className="point-value positive">+{formatNumber(point.points)} pts</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Beneficios destacados con botón de canje */}
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
                  <span className="benefit-title">Cashback</span>
                  <span className="benefit-desc">Hasta 5% de vuelta en tus compras</span>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">⚡</div>
                <div className="benefit-info">
                  <span className="benefit-title">Prioridad</span>
                  <span className="benefit-desc">Transacciones prioritarias</span>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🎁</div>
                <div className="benefit-info">
                  <span className="benefit-title">Bonos</span>
                  <span className="benefit-desc">Bonos de puntos por nivel</span>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💎</div>
                <div className="benefit-info">
                  <span className="benefit-title">Límites</span>
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