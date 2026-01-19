import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import ProtectedRoute from '../ProtectedRoute';
import "./Layout.css"

const Layout: React.FC = () => {
  // Toggle sidebar visibility
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div  className={`grid ${sidebarCollapsed ? 'grid-cols-[64px_1fr]' : 'grid-cols-[200px_1fr]'} min-h-screen bg-gray-100 transition-all duration-300`}>
    <div className='relative'>
      <div className='absolute icon-minus'>
      <i className={`btn-toggle bx  ${sidebarCollapsed ? "bx-right-arrow" : "bx-left-arrow"}`}
      onClick={toggleSidebar}
      ></i>
      </div>
      <Sidebar isCollapsed={sidebarCollapsed}/>
    </div>

      <main className="overflow-y-auto h-[100vh]"> { }
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </main>
    </div>
  );
};

export default Layout;