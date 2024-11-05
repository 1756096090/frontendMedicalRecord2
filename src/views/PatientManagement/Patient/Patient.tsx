import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../../models/Patient';
import { PatientController } from '../../../controllers/PatientController';
import PatientListView from '../Patient/PatientList';

const PatientCrud: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [controller] = useState(new PatientController());
    const navigate = useNavigate();
    
    const loadPatients = useCallback(async () => {
        try {
            const data = await controller.getPatients();
            setPatients(data);
        } catch (error) {
            console.error("Failed to load patients", error);
        }
    }, [controller]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    const handleCreate = () => {
        navigate('/patient/edit/new');
    };

    const handleEdit = (id: string) => {
        navigate(`/patient/edit/${id}`);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Gestión de Pacientes</h1>
                <button
                    onClick={handleCreate}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md focus:outline-none transition ease-in-out duration-300"
                >
                    Crear Paciente
                </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                <PatientListView 
                    patients={patients} 
                    onEdit={handleEdit}
                />
            </div>
        </div>
    );
};

export default PatientCrud;