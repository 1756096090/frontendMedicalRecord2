// src/components/SpecialistCrud.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Specialist } from '../../../models/Specialist';
import { SpecialistController } from '../../../controllers/SpecialistController';
import SpecialistListView from '../Specialist/SpecialistList'

const SpecialistCrud: React.FC = () => {
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [controller] = useState(new SpecialistController());
    const navigate = useNavigate(); 

    const loadSpecialists = useCallback(async () => {
        try {
            const data = await controller.getSpecialists();
            setSpecialists(data);
        } catch (error) {
            console.error("Failed to load specialists", error);
        }
    }, [controller]);

    useEffect(() => { 
        loadSpecialists();
    }, [loadSpecialists]);

    const handleCreate = () => {
        navigate('/specialist/edit/new'); 
    };

    const handleEdit = (id: string) => {
        navigate(`/specialist/edit/${id}`); 
    };

    const handleDelete = async (id: string) => {
        try {
            await controller.removeSpecialist(id);
            await loadSpecialists();
        } catch (error) {
            console.error("Failed to delete specialist", error);
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
                <SpecialistListView specialists={specialists} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
        </div>
    );
};

export default SpecialistCrud;
