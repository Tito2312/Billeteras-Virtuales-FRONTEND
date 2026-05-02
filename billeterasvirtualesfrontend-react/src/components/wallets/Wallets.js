// Wallets.js - Página de gestión de billeteras
// Muestra todas las billeteras en grid, con opciones de crear, editar, eliminar

import React, { useState } from 'react';
import CreateWalletModal from './CreateWalletModal';
import EditWalletModal from './EditWalletModal';
import DeleteWalletModal from './DeleteWalletModal';
import './Wallets.css';

const Wallets = ({ user }) => {
  const [wallets, setWallets] = useState([
    { id: 1, name: 'Principal', type: 'Gastos diarios', balance: 25430.50, description: 'Billetera principal para gastos diarios' },
    { id: 2, name: 'Ahorros', type: 'Ahorro', balance: 8920.00, description: 'Cuenta de ahorros para metas' },
    { id: 3, name: 'Inversión', type: 'Inversión', balance: 15600.75, description: 'Portafolio de inversiones' },
    { id: 4, name: 'Viajes', type: 'Ahorro', balance: 3500.00, description: 'Ahorro para vacaciones' },
    { id: 5, name: 'Emergencias', type: 'Ahorro', balance: 12000.00, description: 'Fondo de emergencias' }
  ]);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  
  // Tipos de billetera disponibles
  const walletTypes = [
    { value: 'Gastos diarios', label: 'Gastos diarios', icon: '☕' },
    { value: 'Ahorro', label: 'Ahorro', icon: '🏦' },
    { value: 'Inversión', label: 'Inversión', icon: '📈' },
    { value: 'Transporte', label: 'Transporte', icon: '🚗' },
    { value: 'Compras', label: 'Compras', icon: '🛍️' }
  ];
  
  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Obtener iniciales
  const getInitials = (name) => {
    if (name === 'Principal') return 'PP';
    if (name === 'Ahorros') return 'AH';
    if (name === 'Inversión') return 'IN';
    if (name === 'Viajes') return 'VJ';
    if (name === 'Emergencias') return 'EM';
    return name.substring(0, 2).toUpperCase();
  };
  
  // Crear nueva billetera
  const handleCreateWallet = (walletData) => {
    const newWallet = {
      id: Date.now(),
      ...walletData,
      balance: parseFloat(walletData.balance) || 0
    };
    setWallets([...wallets, newWallet]);
    alert(`✅ Billetera "${walletData.name}" creada exitosamente\n\n(Datos guardados temporalmente en frontend)`);
  };
  
  // Editar billetera
  const handleEditWallet = (updatedData) => {
    setWallets(wallets.map(w => 
      w.id === selectedWallet.id 
        ? { ...w, ...updatedData, balance: parseFloat(updatedData.balance) }
        : w
    ));
    setShowEditModal(false);
    setSelectedWallet(null);
    alert(`✅ Billetera actualizada exitosamente`);
  };
  
  // Eliminar billetera
  const handleDeleteWallet = () => {
    setWallets(wallets.filter(w => w.id !== selectedWallet.id));
    setShowDeleteModal(false);
    setSelectedWallet(null);
    alert(`🗑️ Billetera eliminada exitosamente`);
  };
  
  // Abrir menú de opciones
  const toggleMenu = (walletId) => {
    setMenuOpenId(menuOpenId === walletId ? null : walletId);
  };
  
  // Abrir modal de edición
  const openEditModal = (wallet) => {
    setSelectedWallet(wallet);
    setShowEditModal(true);
    setMenuOpenId(null);
  };
  
  // Abrir modal de eliminación
  const openDeleteModal = (wallet) => {
    setSelectedWallet(wallet);
    setShowDeleteModal(true);
    setMenuOpenId(null);
  };
  
  // Cerrar menú al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
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
          <span className="stat-number">{formatCurrency(wallets.reduce((sum, w) => sum + w.balance, 0))}</span>
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
            {wallet.description && (
              <p className="wallet-description">{wallet.description}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Modales */}
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