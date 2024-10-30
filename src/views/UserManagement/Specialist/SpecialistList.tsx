import React from 'react';
import { Specialist } from '../../../models/Specialist';

interface SpecialistListViewProps {
    specialists: Specialist[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const SpecialistListView: React.FC<SpecialistListViewProps> = ({ specialists, onEdit, onDelete }) => {
    return (
        <table className="min-w-full border-collapse border border-gray-200">
            <thead>
                <tr>
                    <th className="border border-gray-200 p-2" scope="col">Nombre de la Especialidad</th>
                    <th className="border border-gray-200 p-2" scope="col">Descripción</th>
                    <th className="border border-gray-200 p-2" scope="col">Años de experienvia</th>
                    <th className="border border-gray-200 p-2" scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {specialists.map((specialist) => (
                    <tr key={specialist.ID}>
                        <td className="border border-gray-200 p-2">{specialist.Specialization}</td>
                        <td className="border border-gray-200 p-2">{specialist.Description}</td>
                        <td className="border border-gray-200 p-2">{specialist.YearsOfExperience}</td>
                        <td className="border border-gray-200 p-2">
                            <button
                                onClick={() => onEdit(specialist.ID ?? '')}
                                className="bg-yellow-500 text-white p-1 mr-1 hover:bg-yellow-400"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete(specialist.ID ?? '')}
                                className="bg-red-500 text-white p-1 hover:bg-red-400"
                            >
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SpecialistListView;
