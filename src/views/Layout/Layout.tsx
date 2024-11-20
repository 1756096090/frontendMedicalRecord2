import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import ProtectedRoute from '../ProtectedRoute';

const Layout: React.FC = () => {
  return (
    <div className="grid grid-cols-[200px_1fr] min-h-screen bg-gray-100"> {}
      <Sidebar />
      <main className="overflow-y-auto"> {}
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </main>
    </div>
  );
};

export default Layout;