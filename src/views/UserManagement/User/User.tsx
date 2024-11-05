// src/components/UserCrud.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../../models/User';
import { UserController } from '../../../controllers/UserController';
import UserListView from '../User/UserList';
import { RoleController } from '../../../controllers/RoleController';
import { SpecialistController } from '../../../controllers/SpecialistController';
import { Role } from '../../../models/Role';
import { Specialist } from '../../../models/Specialist';

const UserCrud: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRole] = useState<Role[]>([]);
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [controller] = useState(new UserController());
    const [roleController] = useState(new RoleController());
    const [specialistController] = useState(new SpecialistController());

    const navigate = useNavigate(); 

    const loadUsers = useCallback(async () => {
        try {
            const data = await controller.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    }, [controller]);

    const loadRoles = useCallback(async () => {
        try {
            const data = await roleController.getRoles();
            setRole(data);
        } catch (error) {
            console.error("Failed to load roles", error);
        }
    }, [roleController]);

    const loadSpecialists = useCallback(async () => {
        try {
            const data = await specialistController.getSpecialists();
            setSpecialists(data);
        } catch (error) {
            console.error("Failed to load specialists", error);
        }
    }, [specialistController]);

    useEffect(() => { 
        loadUsers();
        loadSpecialists();
        loadRoles();
    }, [loadUsers, loadSpecialists, loadRoles]);

    const handleCreate = () => {
        navigate('/user/edit/new'); 
    };

    const handleEdit = (id: string) => {
        navigate(`/user/edit/${id}`); 
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={handleCreate}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md focus:outline-none transition ease-in-out duration-300"
                >
                    Crear Usuario
                </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-inner" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <UserListView users={users} roles={roles} specialists={specialists} onEdit={handleEdit} />
            </div>
        </div>
    );
};

export default UserCrud;
