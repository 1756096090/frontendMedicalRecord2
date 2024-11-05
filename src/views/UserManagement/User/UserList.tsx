import React from 'react';
import { User } from '../../../models/User';
import { Role } from '../../../models/Role';
import { Specialist } from '../../../models/Specialist';

interface UserListViewProps {
    users: User[];
    roles: Role[];
    specialists: Specialist[];
    onEdit: (id: string) => void;
}

const UserListView: React.FC<UserListViewProps> = ({ users, roles, specialists, onEdit }) => {
    const getRoleName = (roleId: string) => {
        const role = roles.find((r) => r.ID === roleId);
        return role ? role.Name : 'N/A';
    };

    const getSpecialistDetails = (specialistId: string) => {
        const specialist = specialists.find((s) => s.ID === specialistId);
        return specialist
            ? {
                specialization: specialist.Specialization,
                description: specialist.Description,
                experience: specialist.YearsOfExperience,
            }
            : { specialization: 'N/A', description: 'N/A', experience: 'N/A' };
    };

    return (
        <table className="min-w-full border-collapse border border-gray-200">
            <thead>
                <tr>
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
                {users.map((user) => {
                    const roleName = getRoleName(user.RoleID);
                    const specialistDetails = getSpecialistDetails(user.SpecialistID);

                    return (
                        <tr key={user.ID}>
                            <td className="border border-gray-200 p-2">{user.Name}</td>
                            <td className="border border-gray-200 p-2">{user.Email}</td>
                            <td className="border border-gray-200 p-2">{user.Phone}</td>
                            <td className="border border-gray-200 p-2">{user.Address}</td>
                            <td className="border border-gray-200 p-2">{user.Gender}</td>
                            <td className="border border-gray-200 p-2">{user.DNI}</td>
                            <td className="border border-gray-200 p-2">
                                {user.BirthDate ? new Date(user.BirthDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="border border-gray-200 p-2">{roleName}</td>
                            <td className="border border-gray-200 p-2">
                                {roles.find((r) => r.ID === user.RoleID)?.Permissions.join(', ') || 'N/A'}
                            </td>
                            <td className="border border-gray-200 p-2">{specialistDetails.specialization}</td>
                            <td className="border border-gray-200 p-2">{specialistDetails.description}</td>
                            <td className="border border-gray-200 p-2">{specialistDetails.experience}</td>
                            <td className="border border-gray-200 p-2">{user.HasAccess ? 'Sí' : 'No'}</td>
                            <td className="border border-gray-200 p-2">
                                <button
                                    onClick={() => onEdit(user.ID)}
                                    className="bg-yellow-500 text-white p-1 mr-1 hover:bg-yellow-400"
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default UserListView;
