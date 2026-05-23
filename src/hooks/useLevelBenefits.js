// useLevelBenefits.js - Hook para obtener beneficios según nivel
// Opción B: La comisión la paga el destinatario (se descuenta de lo que recibe)

// Función para normalizar el nivel (inglés o español)
const normalizeLevel = (level) => {
  const levelMap = {
    'bronze': 'Bronce',
    'silver': 'Plata',
    'gold': 'Oro',
    'platinum': 'Platino',
    'bronce': 'Bronce',
    'plata': 'Plata',
    'oro': 'Oro',
    'platino': 'Platino'
  };
  return levelMap[level?.toLowerCase()] || 'Bronce';
};

const getCommissionRate = (level) => {
  const normalizedLevel = normalizeLevel(level);
  switch(normalizedLevel) {
    case 'Bronce': return 0.05;
    case 'Plata': return 0.03;
    case 'Oro': return 0.015;
    case 'Platino': return 0.0;
    default: return 0.05;
  }
};

const getDailyTransactionLimit = (level) => {
  const normalizedLevel = normalizeLevel(level);
  switch(normalizedLevel) {
    case 'Bronce': return 1000000;
    case 'Plata': return 5000000;
    case 'Oro': return 15000000;
    case 'Platino': return Infinity;
    default: return 1000000;
  }
};

// Límite en cantidad de transferencias por día (igual que el backend)
const getDailyTransferCount = (level) => {
  const normalizedLevel = normalizeLevel(level);
  switch(normalizedLevel) {
    case 'Bronce': return 10;
    case 'Plata': return 25;
    case 'Oro': return 50;
    case 'Platino': return Infinity;
    default: return 10;
  }
};

const getPointsBonus = (level) => {
  const normalizedLevel = normalizeLevel(level);
  switch(normalizedLevel) {
    case 'Bronce': return 0;
    case 'Plata': return 0.10;
    case 'Oro': return 0.25;
    case 'Platino': return 0.50;
    default: return 0;
  }
};

const getProcessingPriority = (level) => {
  const normalizedLevel = normalizeLevel(level);
  switch(normalizedLevel) {
    case 'Platino': return 1;
    case 'Oro': return 2;
    case 'Plata': return 3;
    case 'Bronce': return 4;
    default: return 4;
  }
};

export const useLevelBenefits = (level) => {
  const normalizedLevel = normalizeLevel(level);
  const commissionRate = getCommissionRate(level);
  const dailyTransactionLimit = getDailyTransactionLimit(level);
  const dailyTransferCount = getDailyTransferCount(level);
  const pointsBonus = getPointsBonus(level);
  const processingPriority = getProcessingPriority(level);
  
  return {
    commissionRate,
    dailyTransactionLimit,
    dailyTransferCount,
    pointsBonus,
    processingPriority,
    level: normalizedLevel,
    formatTransferCount: () => dailyTransferCount === Infinity ? 'Ilimitadas' : `${dailyTransferCount} transferencias/día`,
    
    // Comisión que se cobra (se descuenta del destinatario)
    calculateCommission: (amount) => amount * commissionRate,
    
    // Lo que realmente recibe el destinatario
    calculateReceiverAmount: (amount) => amount - (amount * commissionRate),
    
    // Total que se debita de la billetera origen (solo el monto, la comisión no la paga el origen)
    calculateTotalDebit: (amount) => amount,
    
    calculatePointsWithBonus: (basePoints) => {
      return Math.floor(basePoints * (1 + pointsBonus));
    },
    
    validateTransactionLimit: (amount, todayTransactionsTotal = 0) => {
      return (todayTransactionsTotal + amount) <= dailyTransactionLimit;
    },
    
    formatLimit: () => {
      if (dailyTransactionLimit === Infinity) return 'Ilimitado';
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(dailyTransactionLimit);
    },
    
    formatCommissionRate: () => {
      if (commissionRate === 0) return '0%';
      return `${commissionRate * 100}%`;
    },
    
    formatPointsBonus: () => {
      if (pointsBonus === 0) return 'Sin bono';
      return `+${pointsBonus * 100}%`;
    }
  };
};