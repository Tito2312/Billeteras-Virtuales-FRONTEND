// Wallets.js - Página de gestión de billeteras (CONECTADO A API)
// Sin botones de Recargar, Transferir y Retirar

import React, { useState, useEffect, useCallback } from 'react';
import { getUserWallets, createWallet, updateWallet } from '../../API/wallets';
import { getCurrentUser } from '../../API/auth';
import CreateWalletModal from './CreateWalletModal';
import EditWalletModal from './EditWalletModal';
import DeleteWalletModal from './DeleteWalletModal';
import './Wallets.css';

const Wallets = ({ user }) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  
  const userId = user?.id || getCurrentUser()?.id;
  
  const walletTypes = [
    { value: 'Gastos diarios', label: 'Gastos diarios', icon: '☕' },
    { value: 'Ahorro', label: 'Ahorro', icon: '🏦' },
    { value: 'Inversión', label: 'Inversión', icon: '📈' },
    { value: 'Transporte', label: 'Transporte', icon: '🚗' },
    { value: 'Compras', label: 'Compras', icon: '🛍️' }
  ];
  
  const loadWallets = useCallback(async () => {
    setLoading(true);
    const result = await getUserWallets(userId);
    if (result.success && result.data) {
      setWallets(result.data);
    }
    setLoading(false);
  }, [userId]);
  
  useEffect(() => {
    if (userId) loadWallets();
  }, [userId, loadWallets]);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  const getInitials = (name) => {
    if (!name) return '??';
    if (name === 'Principal') return 'PP';
    if (name === 'Ahorros') return 'AH';
    if (name === 'Inversión') return 'IN';
    if (name === 'Viajes') return 'VJ';
    if (name === 'Emergencias') return 'EM';
    return name.substring(0, 2).toUpperCase();
  };
  
  const handleCreateWallet = async (walletData) => {
    const result = await createWallet({
      name: walletData.name,
      type: walletData.type,
      userId: userId
    });
    
    if (result.success) {
      await loadWallets();
      alert(`✅ Billetera "${walletData.name}" creada exitosamente`);
    } else {
      alert(`❌ Error al crear: ${result.message}`);
    }
    setShowCreateModal(false);
  };
  
  const handleEditWallet = async (updatedData) => {
    const result = await updateWallet(selectedWallet.id, userId, {
      name: updatedData.name,
      type: updatedData.type
    });
    
    if (result.success) {
      await loadWallets();
      alert(`✅ Billetera actualizada exitosamente`);
    } else {
      alert(`❌ Error al actualizar: ${result.message}`);
    }
    setShowEditModal(false);
    setSelectedWallet(null);
  };
  
  const handleDeleteWallet = () => {
    alert(`🗑️ Eliminar billetera "${selectedWallet?.name}"\n\n⚠️ El backend aún no tiene endpoint DELETE.`);
    setShowDeleteModal(false);
    setSelectedWallet(null);
  };
  
  const toggleMenu = (walletId) => {
    setMenuOpenId(menuOpenId === walletId ? null : walletId);
  };
  
  const openEditModal = (wallet) => {
    setSelectedWallet(wallet);
    setShowEditModal(true);
    setMenuOpenId(null);
  };
  
  const openDeleteModal = (wallet) => {
    setSelectedWallet(wallet);
    setShowDeleteModal(true);
    setMenuOpenId(null);
  };
  
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  if (loading) {
    return (
      <div className="wallets-page">
        <div className="loading-container-wallets">
          <div className="loading-spinner-small"></div>
          <p>Cargando billeteras...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="wallets-page">
      <div className="wallets-header">
        <div>
          <h1>Gestión de Billeteras</h1>
          <p>Administra tus billeteras digitales</p>
        </div>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          + Crear Nueva Billetera
        </button>
      </div>
      
      <div className="wallets-stats">
        <div className="stat-badge">
          <span className="stat-label">Total Billeteras</span>
          <span className="stat-number">{wallets.length}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-label">Balance Total</span>
          <span className="stat-number">{formatCurrency(wallets.reduce((sum, w) => sum + (w.balance || 0), 0))}</span>
        </div>
      </div>
      
      <div className="wallets-grid-full">
        {wallets.map(wallet => (
          <div key={wallet.id} className="wallet-card-full">
            <div className="wallet-card-header-full">
              <div className="wallet-icon-full">
                <span>{getInitials(wallet.name)}</span>
              </div>
              <div className="wallet-info-full">
                <h3>{wallet.name}</h3>
                <p>{wallet.type}</p>
              </div>
              <div className="wallet-menu">
                <button 
                  className="menu-trigger" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(wallet.id);
                  }}
                >
                  ⋮
                </button>
                {menuOpenId === wallet.id && (
                  <div className="menu-dropdown">
                    <button onClick={() => openEditModal(wallet)}>
                      ✏️ Editar
                    </button>
                    <button onClick={() => openDeleteModal(wallet)} className="danger">
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="wallet-balance-full">
              <span className="balance-label-full">BALANCE DISPONIBLE</span>
              <span className="balance-value-full">{formatCurrency(wallet.balance)}</span>
            </div>
            <p className="wallet-status">
              Estado: <span className={wallet.active ? 'status-active' : 'status-inactive'}>
                {wallet.active ? 'Activa' : 'Inactiva'}
              </span>
            </p>
          </div>
        ))}
      </div>
      
      <CreateWalletModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateWallet}
        walletTypes={walletTypes}
      />
      
      <EditWalletModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedWallet(null);
        }}
        onEdit={handleEditWallet}
        wallet={selectedWallet}
        walletTypes={walletTypes}
      />
      
      <DeleteWalletModal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedWallet(null);
        }}
        onDelete={handleDeleteWallet}
        wallet={selectedWallet}
      />
    </div>
  );
};

export default Wallets;