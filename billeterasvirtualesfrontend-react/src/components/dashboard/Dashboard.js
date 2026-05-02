// Dashboard.js - Componente temporal que se muestra después del inicio de sesión
// Más adelante lo reemplazaremos con el diseño completo de la imagen (billeteras, gráficos, etc.)

import React from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-container">
      {/* Barra superior con información del usuario */}
      <header className="dashboard-header">
        <div className="logo">
          <h1>FinWallet</h1>
        </div>
        <div className="user-info">
          <span className="user-name">{user.nombre}</span>
          <span className="user-level">Nivel: {user.nivel}</span>
          <span className="user-points">🎯 {user.puntos} pts</span>
          <button onClick={onLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido principal (temporal, después pondremos el diseño real) */}
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>¡Bienvenido/a, {user.nombre}!</h2>
          <p>Has iniciado sesión correctamente en FinWallet.</p>
          <p>Tu correo electrónico es: {user.email}</p>
          {user.telefono && <p>Teléfono: {user.telefono}</p>}
          {user.documento && <p>Documento: {user.documento}</p>}
          <div className="stats">
            <div className="stat">
              <h3>Puntos acumulados</h3>
              <p className="stat-value">{user.puntos}</p>
            </div>
            <div className="stat">
              <h3>Nivel actual</h3>
              <p className="stat-value">{user.nivel}</p>
            </div>
            <div className="stat">
              <h3>Miembro desde</h3>
              <p className="stat-value">
                {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        <div className="info-message">
          <p>
            ⚠️ Esta es una vista temporal. Próximamente agregaremos el Dashboard completo con:
          </p>
          <ul>
            <li>💳 Mis Billeteras</li>
            <li>💰 Balance total</li>
            <li>📊 Gráficos de evolución</li>
            <li>🔄 Transacciones recientes</li>
            <li>📈 Analítica de movimientos</li>
            <li>⚡ Operaciones programadas</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;