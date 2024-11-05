// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './views/Layout/Layout';
import Login from './views/Login/Login';
import UserManagement from './views/UserManagement/UserManagement';
import SpecialistEdit from './views/UserManagement/Specialist/SpecialistEdit';
import UserEdit from './views/UserManagement/User/UserEdit';
import PatientCrud from './views/PatientManagement/Patient/Patient';
import PatientEdit from './views/PatientManagement/Patient/PatientEdit';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<Layout />}>
          {/* Las rutas dentro de Layout deberían ser hijas */}
          <Route path="user-management" element={<UserManagement />} />
          <Route path="specialist/edit/:id" element={<SpecialistEdit />} />
          <Route path="user/edit/:id" element={<UserEdit />} />
          <Route path="patient-management" element={<PatientCrud />} />
          <Route path='patient/edit/:id' element={<PatientEdit />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
