import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '../../utils/toast';
import { getUserScheduledOperations, createScheduledOperation, updateScheduledOperation, deleteScheduledOperation } from '../../API/scheduled';
import { getUserWallets } from '../../API/wallets';
import { getCurrentUser } from '../../API/auth';
import CreateScheduledModal from './CreateScheduledModal';
import EditScheduledModal from './EditScheduledModal';
import CancelScheduledModal from './CancelScheduledModal';
import './Scheduled.css';

const Scheduled = ({ user }) => {
  const [operations, setOperations] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');

  const [editingOperation, setEditingOperation] = useState(null);
  const [cancelingOperation, setCancelingOperation] = useState(null);

  const userId = user?.id || getCurrentUser()?.id;

  const loadOperations = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await getUserScheduledOperations(userId);
      if (result.success && result.data) {

        const sorted = [...result.data].sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
          if (a.status === 'PENDING' && b.status === 'PENDING') {
            return new Date(a.scheduledDate + 'Z') - new Date(b.scheduledDate + 'Z');
          }
          return new Date(b.scheduledDate + 'Z') - new Date(a.scheduledDate + 'Z');
        });

        setOperations(sorted);
        setError('');

        console.log('📋 Operaciones cargadas y ordenadas:', sorted.map(op => ({
          id: op.id,
          type: op.type,
          status: op.status,
          scheduledDate: op.scheduledDate
        })));
      } else {
        setError('Error al cargar las operaciones');
      }
    } catch (err) {
      console.error('Error cargando operaciones:', err);
      setError('Error al cargar las operaciones');
    }
  }, [userId]);

  const loadWallets = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await getUserWallets(userId);
      if (result.success && result.data) {
        setWallets(result.data);
      }
    } catch (err) {
      console.error('Error cargando billeteras:', err);
    }
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadOperations(), loadWallets()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadOperations(), loadWallets()]);
      setLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      loadOperations();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadOperations, loadWallets]);

  const handleEdit = (operation) => {
    setEditingOperation(operation);
  };

  const handleUpdate = async (id, operationData) => {
    try {

      const result = await updateScheduledOperation(id, operationData, userId);
      if (result.success) {
        await loadOperations();
        toast.success('Operación actualizada correctamente');
      } else {
        toast.error(`Error al actualizar: ${result.message}`);
      }
    } catch (err) {
      console.error('Error en actualización:', err);
      toast.error('Error al actualizar la operación');
    } finally {
      setEditingOperation(null);
    }
  };

  const handleDelete = async (id) => {
    try {

      const result = await deleteScheduledOperation(id, userId);
      if (result.success) {
        await loadOperations();
        toast.success('Operación cancelada correctamente');
      } else {
        toast.error(`Error al cancelar: ${result.message}`);
      }
    } catch (err) {
      console.error('Error en cancelación:', err);
      toast.error('Error al cancelar la operación');
    } finally {
      setCancelingOperation(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const parseAsUTC = (dateString) => {
    if (!dateString) return null;
    const utc = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(utc);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = parseAsUTC(dateString);
      if (!date || isNaN(date.getTime())) return '-';
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    } catch (error) {
      return '-';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'RECHARGE': return '📥';
      case 'WITHDRAWAL': return '📤';
      case 'TRANSFER': return '🔄';
      default: return '💰';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'RECHARGE': return 'Recarga';
      case 'WITHDRAWAL': return 'Retiro';
      case 'TRANSFER': return 'Transferencia';
      default: return type;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'EXECUTED': return 'status-executed';
      case 'FAILED': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'EXECUTED': return 'Ejecutada';
      case 'FAILED': return 'Fallida';
      default: return 'Pendiente';
    }
  };

  const getPriority = (scheduledDate, status) => {
    const now = new Date();
    const date = parseAsUTC(scheduledDate);
    const diffHours = (date - now) / (1000 * 60 * 60);

    if (status === 'EXECUTED') return { label: 'Ejecutada', class: 'priority-executed' };
    if (status === 'FAILED') return { label: 'Fallida', class: 'priority-failed' };
    if (diffHours < 0) return { label: 'Atrasada', class: 'priority-overdue' };
    if (diffHours < 1) return { label: 'Inmediata', class: 'priority-immediate' };
    if (diffHours < 24) return { label: 'Alta', class: 'priority-high' };
    if (diffHours < 72) return { label: 'Media', class: 'priority-medium' };
    return { label: 'Baja', class: 'priority-low' };
  };

  const filteredOperations = operations.filter(op => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return op.status === 'PENDING';
    if (filterStatus === 'executed') return op.status === 'EXECUTED';
    if (filterStatus === 'failed') return op.status === 'FAILED';
    return true;
  });

  const pendingCount = operations.filter(o => o.status === 'PENDING').length;
  const executedCount = operations.filter(o => o.status === 'EXECUTED').length;
  const failedCount = operations.filter(o => o.status === 'FAILED').length;

  const handleCreateOperation = async (operationData) => {
    console.log('🔍 userId actual:', userId);
    console.log('🔍 operationData recibido:', operationData);

    try {
      const result = await createScheduledOperation({
        userId: userId,
        sourceWalletId: operationData.sourceWalletId || null,
        targetWalletId: operationData.targetWalletId || null,
        transferKey: operationData.transferKey || null,
        type: operationData.type,
        amount: operationData.amount,
        scheduledDate: operationData.scheduledDate
      });

      console.log('🔍 Resultado del backend:', result);

      if (result.success) {
        await loadOperations();
        toast.success('Operación programada exitosamente');
        setShowCreateModal(false);
      } else {
        toast.error(`Error al programar: ${result.message}`);
      }
    } catch (err) {
      console.error('🔍 Error capturado:', err);
      toast.error('Error al programar la operación');
    }
  };

  if (loading) {
    return (
      <div className="scheduled-page">
        <div className="loading-container-scheduled">
          <div className="loading-spinner-small"></div>
          <p>Cargando operaciones programadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduled-page">
      <div className="scheduled-header">
        <div>
          <h1>Operaciones Programadas</h1>
          <p>Gestiona tus movimientos automáticos</p>
        </div>
        <div className="header-buttons">
          <button className="btn-refresh-scheduled" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '⏳' : '🔄'} Actualizar
          </button>
          <button className="btn-create-scheduled" onClick={() => setShowCreateModal(true)}>
            + Programar Operación
          </button>
        </div>
      </div>

      <div className="scheduled-stats">
        <div className="stat-card-scheduled pending">
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card-scheduled executed">
          <span className="stat-value">{executedCount}</span>
          <span className="stat-label">Ejecutadas</span>
        </div>
        <div className="stat-card-scheduled failed">
          <span className="stat-value">{failedCount}</span>
          <span className="stat-label">Fallidas</span>
        </div>
      </div>

      <div className="filters-scheduled">
        <button className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
          Todas ({operations.length})
        </button>
        <button className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
          Pendientes ({pendingCount})
        </button>
        <button className={`filter-btn ${filterStatus === 'executed' ? 'active' : ''}`} onClick={() => setFilterStatus('executed')}>
          Ejecutadas ({executedCount})
        </button>
        <button className={`filter-btn ${filterStatus === 'failed' ? 'active' : ''}`} onClick={() => setFilterStatus('failed')}>
          Fallidas ({failedCount})
        </button>
      </div>

      <div className="operations-list">
        {filteredOperations.length > 0 ? (
          filteredOperations.map(op => {
            const priority = getPriority(op.scheduledDate, op.status);
            const isOverdue = op.status === 'PENDING' && parseAsUTC(op.scheduledDate) < new Date();

            return (
              <div key={op.id} className={`operation-card ${priority.class} ${isOverdue ? 'overdue' : ''}`}>
                <div className="operation-priority-badge">
                  <span className={`priority-dot ${priority.class}`}></span>
                  <span className="priority-text">
                    {priority.label}
                    {isOverdue && ' ⚠️'}
                  </span>
                </div>
                <div className="operation-content">
                  <div className="operation-icon">
                    {getTypeIcon(op.type)}
                  </div>
                  <div className="operation-info">
                    <h3>{getTypeLabel(op.type)}</h3>
                    <p className="operation-amount">{formatCurrency(op.amount)}</p>
                    <div className="operation-details">
                      <span className="detail-date">📅 {formatDate(op.scheduledDate)}</span>
                      <span className="detail-wallets">
                        {op.sourceWalletId && `Origen: ${op.sourceWalletId.substring(0, 10)}...`}
                        {op.targetWalletId && ` → Destino: ${op.targetWalletId.substring(0, 10)}...`}
                        {op.transferKey && ` → Clave: ${op.transferKey}`}
                      </span>
                    </div>
                  </div>
                  <div className="operation-actions">
                    {op.status === 'PENDING' && (
                      <>
                        <button className="btn-edit" onClick={() => handleEdit(op)}>✏️ Editar</button>
                        <button className="btn-delete" onClick={() => setCancelingOperation(op)}>🗑️ Eliminar</button>
                      </>
                    )}
                  </div>
                  <div className="operation-status-badge">
                    <span className={`status-badge-scheduled ${getStatusClass(op.status)}`}>
                      {getStatusLabel(op.status)}
                    </span>
                  </div>
                </div>
                {op.errorMessage && (
                  <div className="operation-error">
                    <span>❌ {op.errorMessage}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-operations">
            <p>No hay operaciones programadas</p>
            <span>Haz clic en "Programar Operación" para crear una nueva</span>
          </div>
        )}
      </div>

      <CreateScheduledModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateOperation}
        wallets={wallets}
      />

      <EditScheduledModal
        isOpen={!!editingOperation}
        onClose={() => setEditingOperation(null)}
        onEdit={handleUpdate}
        operation={editingOperation}
        wallets={wallets}
      />

      <CancelScheduledModal
        isOpen={!!cancelingOperation}
        onClose={() => setCancelingOperation(null)}
        onCancel={handleDelete}
        operation={cancelingOperation}
      />
    </div>
  );
};

export default Scheduled;
