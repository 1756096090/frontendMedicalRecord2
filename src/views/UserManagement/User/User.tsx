// src/components/UserCrud.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../../models/User';
import { UserController } from '../../../controllers/UserController';
import UserListView from '../User/UserList'

const UserCrud: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [controller] = useState(new UserController());
    const navigate = useNavigate(); 

    const loadUsers = useCallback(async () => {
        try {
            const data = await controller.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    }, [controller]);

    useEffect(() => { 
        loadUsers();
    }, [loadUsers]);

    const handleCreate = () => {
        navigate('/user/edit/new'); 
    };

    const handleEdit = (id: string) => {
        navigate(`/user/edit/${id}`); 
    };

    const handleDelete = async (id: string) => {
        try {
            await controller.removeUser(id);
            await loadUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const logOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Manejo de usuarios</h1>
            
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={logOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md focus:outline-none transition ease-in-out duration-300"
                >
                    Cerrar sesión
                </button>

                <button 
                    onClick={handleCreate}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md focus:outline-none transition ease-in-out duration-300"
                >
                    Crear Usuario
                </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                <UserListView users={users} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
        </div>
    );
};

export default UserCrud;
