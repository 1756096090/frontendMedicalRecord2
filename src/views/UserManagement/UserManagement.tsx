import React from 'react';
import SpecialistCrud from './Specialist/Specialist';
import UserCrud from './User/User';

const UserManagement: React.FC = () => {
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Administrar Usuarios
            </h1>
            
            {/* User management sections */}
            <section>
                <SpecialistCrud/>
                <UserCrud></UserCrud>
            </section>

        </div>
    );
};

export default UserManagement;
