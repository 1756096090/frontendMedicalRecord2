import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Make sure to import the correct version
import { UserController } from '../controllers/UserController';
import { DiagnosisController } from '../controllers/DiagnosisController';
import { Diagnosis } from '../models/Diagnosis';

interface ProtectedRouteProps {
    children: JSX.Element;
}

interface Token {
    ID: string;
    exp: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // To track if the user is authenticated
    const [loading, setLoading] = useState<boolean>(true); // To handle loading state
    const token = localStorage.getItem('token');
    const userController = new UserController();
    const diagnosisController = new DiagnosisController();

    useEffect(() => {
        const checkAuth = async () => {
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }
            try {
                const dataToken: Token = jwtDecode(token);
                console.log("🚀 ~ dataToken:", dataToken);

                // Check token expiration and ID
                if (dataToken?.exp && dataToken.exp * 1000 < Date.now() && dataToken?.ID) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                } else {
                    const user = await userController.GetUserWithRoleAndSpecialty(dataToken.ID);
                    const diagnosis:Diagnosis[] = await diagnosisController.getDiagnosis();

                    localStorage.setItem('role', JSON.stringify(user.role.Permissions)) 
                    localStorage.setItem("id", JSON.stringify(user.user.ID))
                    localStorage.setItem("diagnosis", JSON.stringify(diagnosis))
                    
                    setIsAuthenticated(true);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error decoding token", error);
                setIsAuthenticated(false);
                setLoading(false);
            }
        };

        checkAuth();
    }, [diagnosisController, token, userController]);

    if (loading) {
        return <div>Loading...</div>; // Optionally, show a loading state
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
