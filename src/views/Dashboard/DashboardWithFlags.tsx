// src/views/Dashboard/DashboardWithFlags.tsx
import React from 'react';
import { useFlags } from 'launchdarkly-react-client-sdk';
import OldDashboard from './OldDashboard';
import NewDashboard from './NewDashboard';

/**
 * DashboardWithFlags - Componente que usa LaunchDarkly Feature Flags
 * 
 * IMPLEMENTACIÓN DE ESTRATEGIAS DE DESPLIEGUE:
 * 
 * 1. CANARY RELEASE (Despliegue Gradual):
 *    - LaunchDarkly permite habilitar el flag 'new-dashboard' para un porcentaje
 *      específico de usuarios (ej: 5%, 25%, 50%, 100%)
 *    - Esto permite validar la nueva versión con un grupo pequeño antes de
 *      exponerla a todos los usuarios
 *    - Si hay problemas, se puede desactivar el flag instantáneamente sin redeployar
 * 
 * 2. DARK LAUNCH (Lanzamiento Oscuro):
 *    - El código de NewDashboard está desplegado en producción en todos los servidores
 *    - Pero solo se activa cuando el flag está ON
 *    - Permite probar el código en producción sin impactar a los usuarios
 *    - Útil para validar rendimiento, logs, y comportamiento en entorno real
 * 
 * 3. A/B TESTING:
 *    - LaunchDarkly puede dividir usuarios en grupos (A: old, B: new)
 *    - Permite comparar métricas entre ambas versiones
 *    - Basado en datos, se puede decidir qué versión es mejor
 * 
 * 4. ROLLBACK INSTANTÁNEO:
 *    - Si la nueva versión tiene problemas, se desactiva el flag desde LaunchDarkly
 *    - No requiere revertir código ni redeployar
 *    - Tiempo de recuperación: segundos en lugar de minutos/horas
 */
const DashboardWithFlags: React.FC = () => {
  // Hook de LaunchDarkly para obtener los feature flags
  const flags = useFlags();
  
  // Flag que controla qué versión del dashboard mostrar
  // Por defecto es false (muestra OldDashboard)
  const showNewDashboard = flags['new-dashboard'] || false;

  // Logging para monitoreo y debugging
  console.log('[LaunchDarkly] Feature Flags:', {
    'new-dashboard': showNewDashboard,
    timestamp: new Date().toISOString()
  });

  // Renderizado condicional basado en el feature flag
  return (
    <>
      {showNewDashboard ? <NewDashboard /> : <OldDashboard />}
      
      {/* Indicador visual para desarrollo/testing */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: showNewDashboard ? '#10b981' : '#6b7280',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 9999
      }}>
        {showNewDashboard ? '🚀 NEW' : '📊 CLASSIC'}
      </div>
    </>
  );
};

export default DashboardWithFlags;
