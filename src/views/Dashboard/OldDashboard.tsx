// src/views/Dashboard/OldDashboard.tsx
import React from 'react';
import './Dashboard.css';

/**
 * OldDashboard - Versión anterior del dashboard
 * Este componente se muestra cuando el feature flag 'new-dashboard' está DESACTIVADO
 */
const OldDashboard: React.FC = () => {
  return (
    <div className="dashboard-container old-dashboard">
      <h1>📊 Dashboard - Versión Clásica</h1>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Bienvenido al Sistema de Registros Médicos</h2>
          <p>Esta es la versión estable del dashboard.</p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Pacientes</h3>
            <p className="stat-number">150</p>
          </div>
          <div className="stat-card">
            <h3>Citas Hoy</h3>
            <p className="stat-number">12</p>
          </div>
          <div className="stat-card">
            <h3>Especialistas</h3>
            <p className="stat-number">25</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OldDashboard;
