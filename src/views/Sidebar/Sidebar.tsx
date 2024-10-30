import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-gray-800 text-white h-full p-4">
      <ul className="space-y-4">
        <h1>Dashboard</h1>
        <li><a href="/user-management" className="block text-lg hover:underline">Administrar Usuarios</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
