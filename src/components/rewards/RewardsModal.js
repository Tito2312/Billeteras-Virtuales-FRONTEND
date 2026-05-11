// RewardsModal.js - Modal para canjear beneficios
// Permite al usuario canjear sus puntos por recompensas

import React, { useState } from 'react';
import './RewardsModal.css';

const RewardsModal = ({ isOpen, onClose, onRedeem, userPoints, userLevel }) => {
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  
  // Beneficios disponibles para canjear según el nivel del usuario
  const availableBenefits = [
    { 
      id: 1, 
      name: 'Descuento en comisiones', 
      description: 'Reduce tus comisiones al 0% por 1 mes',
      pointsCost: 500,
      minLevel: 'Bronce',
      icon: '💰',
      benefits: 'Ahorra hasta $50,000 en comisiones'
    },
    { 
      id: 2, 
      name: 'Cashback extra', 
      description: 'Obtén 2% de cashback adicional por 30 días',
      pointsCost: 800,
      minLevel: 'Plata',
      icon: '💳',
      benefits: 'Gana más por cada compra'
    },
    { 
      id: 3, 
      name: 'Prioridad en transacciones', 
      description: 'Tus transacciones serán procesadas con prioridad',
      pointsCost: 1000,
      minLevel: 'Plata',
      icon: '⚡',
      benefits: 'Transacciones más rápidas'
    },
    { 
      id: 4, 
      name: 'Límite de transacción aumentado', 
      description: 'Aumenta tu límite de transacción a $10,000,000',
      pointsCost: 1500,
      minLevel: 'Oro',
      icon: '📈',
      benefits: 'Mayor capacidad de movimiento'
    },
    { 
      id: 5, 
      name: 'Asesoría financiera', 
      description: 'Consulta personalizada con un asesor',
      pointsCost: 2000,
      minLevel: 'Oro',
      icon: '👨‍💼',
      benefits: 'Planifica tu futuro financiero'
    },
    { 
      id: 6, 
      name: 'Eventos exclusivos', 
      description: 'Acceso a eventos VIP de FinWallet',
      pointsCost: 3000,
      minLevel: 'Platino',
      icon: '🎉',
      benefits: 'Networking y experiencias únicas'
    }
  ];
  
  // Filtrar beneficios según nivel del usuario
  const levelOrder = { 'Bronce': 1, 'Plata': 2, 'Oro': 3, 'Platino': 4 };
  const userLevelValue = levelOrder[userLevel] || 1;
  
  const filteredBenefits = availableBenefits.filter(benefit => {
    const benefitLevelValue = levelOrder[benefit.minLevel] || 1;
    return benefitLevelValue <= userLevelValue;
  });
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };
  
  const handleSelectBenefit = (benefit) => {
    setSelectedBenefit(benefit);
  };
  
  const handleRedeem = () => {
    if (!selectedBenefit) {
      alert('Selecciona un beneficio para canjear');
      return;
    }
    
    if (userPoints < selectedBenefit.pointsCost) {
      alert(`No tienes suficientes puntos. Necesitas ${formatNumber(selectedBenefit.pointsCost)} puntos.`);
      return;
    }
    
    onRedeem({
      benefit: selectedBenefit,
      pointsSpent: selectedBenefit.pointsCost,
      date: new Date().toISOString()
    });
    
    setSelectedBenefit(null);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-rewards" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="rewards-icon-wrapper">
            <span className="rewards-icon">🎁</span>
          </div>
          <h2>Canjear Beneficios</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Puntos disponibles */}
          <div className="points-available-card">
            <span className="points-label">Tus puntos disponibles</span>
            <span className="points-value">{formatNumber(userPoints)}</span>
            <span className="points-level">Nivel {userLevel}</span>
          </div>
          
          {/* Lista de beneficios */}
          <div className="benefits-list-modal">
            <h3>Beneficios disponibles para ti</h3>
            <div className="benefits-grid-modal">
              {filteredBenefits.map(benefit => (
                <div 
                  key={benefit.id}
                  className={`benefit-card ${selectedBenefit?.id === benefit.id ? 'selected' : ''} ${userPoints < benefit.pointsCost ? 'insufficient' : ''}`}
                  onClick={() => userPoints >= benefit.pointsCost && handleSelectBenefit(benefit)}
                >
                  <div className="benefit-icon-modal">{benefit.icon}</div>
                  <div className="benefit-info-modal">
                    <div className="benefit-name">{benefit.name}</div>
                    <div className="benefit-desc-modal">{benefit.description}</div>
                    <div className="benefit-cost">
                      <span className="cost-value">{formatNumber(benefit.pointsCost)} pts</span>
                      {userPoints < benefit.pointsCost && (
                        <span className="insufficient-tag"> puntos insuficientes</span>
                      )}
                    </div>
                    <div className="benefit-bonus">{benefit.benefits}</div>
                  </div>
                  {selectedBenefit?.id === benefit.id && (
                    <div className="selected-check-modal">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Resumen del canje */}
          {selectedBenefit && (
            <div className="redemption-summary">
              <h4>Resumen del canje</h4>
              <div className="summary-row">
                <span>Beneficio:</span>
                <strong>{selectedBenefit.name}</strong>
              </div>
              <div className="summary-row">
                <span>Costo en puntos:</span>
                <strong className="cost-highlight">{formatNumber(selectedBenefit.pointsCost)} puntos</strong>
              </div>
              <div className="summary-row">
                <span>Puntos restantes:</span>
                <span>{formatNumber(userPoints - selectedBenefit.pointsCost)} puntos</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-buttons modal-rewards-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn-redeem"
            onClick={handleRedeem}
            disabled={!selectedBenefit || userPoints < (selectedBenefit?.pointsCost || 0)}
          >
            Canjear Beneficio
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardsModal;