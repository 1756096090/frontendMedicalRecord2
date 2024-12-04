import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = React.useState<string[]>([]);

    const handleLogout = () => {
        // Remove the token from localStorage
        localStorage.removeItem('token');
        // Redirect to login page
        navigate('/');
    };


    useEffect(() => {
        try {
            const storedRoles = JSON.parse(localStorage.getItem('role') || '[]');
            setRoles(storedRoles);
        } catch (error) {
            console.error("Error parsing roles:", error);
            setRoles([]);
        }
    }, []);
    
    const handleRoles = (arr: string[]): boolean => {
        return arr.some(role => roles.includes(role));
    };
    


    return (
        <aside className="bg-gray-800 text-white h-full p-4">
            <div className="flex flex-col h-full">
                <div className="flex-grow">
                    <h1 className="text-xl font-bold mb-6">Dashboard</h1>

                    <ul className="space-y-4">
                        {handleRoles([ "manage_users"]) && (
                            <li>
                                <a 
                                    href="/user-management" 
                                    className="block text-lg hover:text-gray-300 transition-colors duration-200"
                                >
                                    Administrar Usuarios
                                </a>
                            </li>
                        )}

                        {handleRoles(["manage_patient_info"]) && (
                            <li>
                                <a 
                                    href="/patient-management" 
                                    className="block text-lg hover:text-gray-300 transition-colors duration-200"
                                >
                                    Administrar Pacientes
                                </a>
                            </li>
                        )}


                        {handleRoles(["schedule"]) && (
                            <li>
                                <a 
                                    href="/schedule" 
                                    className="block text-lg hover:text-gray-300 transition-colors duration-200"
                                >
                                    Programar Citas
                                </a>
                            </li>
                        )}
                        {handleRoles(["generate_medical_records"]) && (
                            <li>
                                <a 
                                    href="/schedule-records"   
                                    className="block text-lg hover:text-gray-300 transition-colors duration-200"
                                >
                                    Agenda Médico
                                </a>
                            </li>
                        )
                        

                        }
                    </ul>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full mt-auto bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v1a1 1 0 102 0V9z" 
                            clipRule="evenodd" 
                        />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
