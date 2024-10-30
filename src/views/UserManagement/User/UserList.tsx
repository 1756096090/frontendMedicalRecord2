import React from 'react';
import { User } from '../../../models/User';

interface UserListViewProps {
    users: User[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const UserListView: React.FC<UserListViewProps> = ({ users, onEdit, onDelete }) => {
    return (
        <table className="min-w-full border-collapse border border-gray-200">
            <thead>
                <tr>
                    <th className="border border-gray-200 p-2">ID</th>
                    <th className="border border-gray-200 p-2">Nombre</th>
                    <th className="border border-gray-200 p-2">Email</th>
                    <th className="border border-gray-200 p-2">Teléfono</th>
                    <th className="border border-gray-200 p-2">Dirección</th>
                    <th className="border border-gray-200 p-2">Género</th>
                    <th className="border border-gray-200 p-2">DNI</th>
                    <th className="border border-gray-200 p-2">Fecha de Nacimiento</th>
                    <th className="border border-gray-200 p-2">Rol</th>
                    <th className="border border-gray-200 p-2">Permisos</th>
                    <th className="border border-gray-200 p-2">Especialización</th>
                    <th className="border border-gray-200 p-2">Descripción</th>
                    <th className="border border-gray-200 p-2">Años de Experiencia</th>
                    <th className="border border-gray-200 p-2">Acceso</th>
                    <th className="border border-gray-200 p-2">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.ID}>
                        <td className="border border-gray-200 p-2">{user.ID}</td>
                        <td className="border border-gray-200 p-2">{user.Name}</td>
                        <td className="border border-gray-200 p-2">{user.Email}</td>
                        <td className="border border-gray-200 p-2">{user.Phone}</td>
                        <td className="border border-gray-200 p-2">{user.Address}</td>
                        <td className="border border-gray-200 p-2">{user.Gender}</td>
                        <td className="border border-gray-200 p-2">{user.DNI}</td>
                        <td className="border border-gray-200 p-2">
                            {user.BirthDate ? new Date(user.BirthDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="border border-gray-200 p-2">{user.Role.Name}</td>
                        <td className="border border-gray-200 p-2">{user.Role.Permissions.join(', ')}</td>
                        <td className="border border-gray-200 p-2">{user.Specialist?.Specialization || 'N/A'}</td>
                        <td className="border border-gray-200 p-2">{user.Specialist?.Description || 'N/A'}</td>
                        <td className="border border-gray-200 p-2">{user.Specialist?.YearsOfExperience || 'N/A'}</td>
                        <td className="border border-gray-200 p-2">{user.HasAccess ? 'Sí' : 'No'}</td>
                        <td className="border border-gray-200 p-2">
                            <button
                                onClick={() => onEdit(user.ID)}
                                className="bg-yellow-500 text-white p-1 mr-1 hover:bg-yellow-400"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete(user.ID)}
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

export default UserListView;
