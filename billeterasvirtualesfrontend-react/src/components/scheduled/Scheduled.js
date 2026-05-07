// Scheduled.js - Página de operaciones programadas
// Las operaciones se muestran ordenadas por prioridad (Alta > Media > Baja)

import React, { useState } from 'react';
import CreateScheduledModal from './CreateScheduledModal';
import EditScheduledModal from './EditScheduledModal';
import CancelScheduledModal from './CancelScheduledModal';
import './Scheduled.css';

const Scheduled = ({ user }) => {
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  
  // Estado para filtro de prioridad
  const [priorityFilter, setPriorityFilter] = useState('todas');
  
  // Datos de ejemplo para operaciones programadas
  // Ordenadas por prioridad: Alta (3), Media (2), Baja (1)
  const [scheduledOperations, setScheduledOperations] = useState([
  { 
    id: 1, 
    type: 'transferencia', 
    typeLabel: 'Transferencia',
    priority: 'alta', 
    priorityLabel: 'Alta',
    priorityLevel: 3,
    date: '10 de abril de 2026, 10:00',
    fromWallet: 'Billetera Principal',
    toDestination: 'Usuario: juan.perez@email.com',  // Cambiado: puede ser otro usuario
    amount: 1500,
    description: 'Pago mensual',
    status: 'Programada',
    frequency: 'Mensual'
  },
  { 
    id: 2, 
    type: 'retiro', 
    typeLabel: 'Retiro',
    priority: 'media', 
    priorityLabel: 'Media',
    priorityLevel: 2,
    date: '15 de abril de 2026, 08:00',
    fromWallet: 'Billetera Principal',
    toDestination: 'Cuenta Bancaria **** 3456',
    amount: 800,
    description: 'Retiro para gastos',
    status: 'Programada',
    frequency: 'Única'
  },
  { 
    id: 3, 
    type: 'ahorro', 
    typeLabel: 'Ahorro Automático',
    priority: 'baja', 
    priorityLabel: 'Baja',
    priorityLevel: 1,
    date: '20 de abril de 2026, 12:00',
    fromWallet: 'Billetera Principal',
    toDestination: 'Ahorros',
    amount: 2000,
    description: 'Ahorro semanal',
    status: 'Programada',
    frequency: 'Semanal'
  },
  { 
    id: 4, 
    type: 'recarga', 
    typeLabel: 'Recarga Automática',
    priority: 'alta', 
    priorityLabel: 'Alta',
    priorityLevel: 3,
    date: '12 de abril de 2026, 09:00',
    fromWallet: 'Tarjeta **** 4532',
    toDestination: 'Billetera Principal',
    amount: 500,
    description: 'Recarga automática',
    status: 'Programada',
    frequency: 'Semanal'
  }
]);
  
  // Billeteras del usuario (para modales)
  const userWallets = [
    { id: 1, name: 'Principal', balance: 25430.50 },
    { id: 2, name: 'Ahorros', balance: 8920.00 },
    { id: 3, name: 'Inversión', balance: 15600.75 },
    { id: 4, name: 'Viajes', balance: 3500.00 }
  ];
  
  /// Tipos de operación
const operationTypes = [
  { value: 'transferencia', label: 'Transferencia', icon: '🔄' },
  { value: 'recarga', label: 'Recarga automática', icon: '📥' },
  { value: 'retiro', label: 'Retiro programado', icon: '📤' },
  { value: 'ahorro', label: 'Ahorro automático', icon: '🏦' }
];

// Prioridades
const priorities = [
  { value: 'alta', label: 'Alta', level: 3, color: '#ef4444' },
  { value: 'media', label: 'Media', level: 2, color: '#f59e0b' },
  { value: 'baja', label: 'Baja', level: 1, color: '#10b981' }
];

// Frecuencias
const frequencies = [
  { value: 'unica', label: 'Única' },
  { value: 'diaria', label: 'Diaria' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' }
];
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Filtrar por prioridad
  const filteredOperations = scheduledOperations.filter(op => {
    if (priorityFilter === 'todas') return true;
    return op.priority === priorityFilter;
  });
  
  // Ordenar por prioridad (mayor a menor)
  const sortedOperations = [...filteredOperations].sort((a, b) => b.priorityLevel - a.priorityLevel);
  
  // Contar por prioridad
  const counts = {
    alta: scheduledOperations.filter(op => op.priority === 'alta').length,
    media: scheduledOperations.filter(op => op.priority === 'media').length,
    baja: scheduledOperations.filter(op => op.priority === 'baja').length,
    total: scheduledOperations.length
  };
  
  // Obtener clase de prioridad
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baja': return 'priority-low';
      default: return '';
    }
  };
  
  // Obtener icono según tipo
  const getTypeIcon = (type) => {
    switch(type) {
      case 'recarga': return '📥';
      case 'retiro': return '📤';
      case 'transferencia': return '🔄';
      default: return '💰';
    }
  };
  
  // Simular acciones (solo alerta visual)
  const handleCreate = (data) => {
    alert(`📝 Simulación: Programar operación\n\nOrigen: ${data.fromWallet}\nDestino: ${data.toWallet}\nMonto: ${formatCurrency(data.amount)}\nPrioridad: ${data.priority}\n\n⚠️ Esta funcionalidad se conectará con el backend próximamente.`);
    setShowCreateModal(false);
  };
  
  const handleEdit = (data) => {
    alert(`✏️ Simulación: Editar operación programada\n\n${data.description}\n\n⚠️ Esta funcionalidad se conectará con el backend próximamente.`);
    setShowEditModal(false);
    setSelectedOperation(null);
  };
  
  const handleCancel = () => {
    alert(`🗑️ Simulación: Cancelar operación programada\n\n"${selectedOperation?.description}"\n\n⚠️ Esta funcionalidad se conectará con el backend próximamente.`);
    setShowCancelModal(false);
    setSelectedOperation(null);
  };
  
  return (
    <div className="scheduled-page">
      {/* Header */}
      <div className="scheduled-header">
        <div>
          <h1>Operaciones Programadas</h1>
          <p>Movimientos futuros organizados por prioridad</p>
        </div>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          + Programar Operación
        </button>
      </div>
      
      {/* Tarjeta de resumen */}
      <div className="summary-card">
        <div className="summary-title">
          <span className="summary-icon">⏰</span>
          <span>Tienes {counts.total} operaciones programadas pendientes</span>
        </div>
        <div className="priority-badges">
          <span className="badge-high">Alta: {counts.alta}</span>
          <span className="badge-medium">Media: {counts.media}</span>
          <span className="badge-low">Baja: {counts.baja}</span>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${priorityFilter === 'todas' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('todas')}
          >
            Todas
          </button>
          <button 
            className={`filter-btn high ${priorityFilter === 'alta' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('alta')}
          >
            Prioridad Alta
          </button>
          <button 
            className={`filter-btn medium ${priorityFilter === 'media' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('media')}
          >
            Prioridad Media
          </button>
          <button 
            className={`filter-btn low ${priorityFilter === 'baja' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('baja')}
          >
            Prioridad Baja
          </button>
        </div>
      </div>
      
      {/* Lista de operaciones */}
      <div className="operations-list">
        {sortedOperations.length > 0 ? (
          sortedOperations.map(op => (
            <div key={op.id} className={`operation-card ${getPriorityClass(op.priority)}`}>
              <div className="operation-priority">
                <span className={`priority-dot ${getPriorityClass(op.priority)}`}></span>
                <span className="priority-label">{op.priorityLabel}</span>
              </div>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="operation-icon">
                    {getTypeIcon(op.type)}
                  </div>
                  <div className="operation-info">
                    <h3>{op.typeLabel}</h3>
                    <p className="operation-description">{op.description || op.typeLabel}</p>
                    <div className="operation-details">
                      <span className="detail-date">📅 {op.date}</span>
                      <span className="detail-route">
                        {op.fromWallet} → {op.toWallet}
                      </span>
                    </div>
                  </div>
                  <div className="operation-amount">
                    <span className="amount">{formatCurrency(op.amount)}</span>
                    <span className="frequency">{op.frequency}</span>
                  </div>
                  <div className="operation-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => {
                        setSelectedOperation(op);
                        setShowEditModal(true);
                      }}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-cancel-op" 
                      onClick={() => {
                        setSelectedOperation(op);
                        setShowCancelModal(true);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
                <div className="operation-status">
                  <span className="status-badge scheduled">{op.status}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-operations">
            <p>No hay operaciones programadas</p>
            <span>Haz clic en "Programar Operación" para crear una nueva</span>
          </div>
        )}
      </div>
      
      {/* Modales */}
      <CreateScheduledModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        wallets={userWallets}
        operationTypes={operationTypes}
        priorities={priorities}
        frequencies={frequencies}
      />
      
      <EditScheduledModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOperation(null);
        }}
        onEdit={handleEdit}
        operation={selectedOperation}
        wallets={userWallets}
        operationTypes={operationTypes}
        priorities={priorities}
        frequencies={frequencies}
      />
      
      <CancelScheduledModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedOperation(null);
        }}
        onCancel={handleCancel}
        operation={selectedOperation}
      />
    </div>
  );
};

export default Scheduled;