import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import "./Sidebar.css"


interface SidebarProps {
    isCollapsed?: boolean
}
const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const [roles, setRoles] = React.useState<string[]>([]);
    const modules = [
        {
            icon: 'user',
            title: "Administrar Usuarios",
            href: "/user-management",
            roles: ["manage_users"]
        },
        {
            icon: 'plus-medical',
            title: "Administrar Pacientes",
            href: "/patient-management",
            roles: ["manage_patient_info"]
        },
        {
            icon: 'calendar-alt',
            title: "Programar Citas",
            href: "/schedule",
            roles: ["schedule"]
        },
        {
            icon: 'calendar-plus',
            title: "Agenda Médico",
            href: "/schedule-records",
            roles: ["generate_medical_records"]
        },

    ]

    const handleLogout = () => {        // Remove the token from localStorage
        localStorage.removeItem('token');
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
                <div className="flex-grow ">

                    <h1 className="text-xl font-bold mb-6">
                        {isCollapsed ? "" : "Dashboard"}
                    </h1>

                    {
                        modules.map((mod) => {
                            return (
                                handleRoles(mod.roles) && (
                                    <ul className='space-y-4 pt-5' key={mod.href}>
                                        <li className='module'>
                                            <Link
                                                to={mod.href}
                                                className="flex items-center text-lg hover:text-gray-300 transition-colors duration-200"
                                            >
                                                <i className={`bx bx-${mod.icon} bx-sm`} />
                                                {!isCollapsed && <span className="ml-2">{mod.title}</span>}
                                            </Link>
                                        </li>
                                    </ul>
                                )
                            );
                        })
                    }



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
                    {isCollapsed?"":"Cerrar Sesión"}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
