/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserController } from '../../controllers/UserController'; 
import './Login.css';

const Login: React.FC = () => {
    const [controller] = useState(new UserController());
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>(''); 
    const navigate = useNavigate(); 

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(''); 

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        try {
            const dataToken:any = await controller.login(username, password); 
            console.log('Login successful!', { username, token:dataToken.token });
            localStorage.setItem('token', dataToken.token);

            navigate('/users');
        } catch (err) {
            console.error('Login failed:', err);
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className='flex flex-col items-center mt-20'>
            <form onSubmit={handleSubmit}>
                <h1 className='font-bold text-center mb-5 text-gray-800 border-b border-gray-300'>Login</h1>
                <p>Ingrese las credenciales para acceder al sitio</p>
                {error && <p className='text-red-500'>{error}</p>}
                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className='border border-gray-300 p-2 mb-4 rounded'
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='border border-gray-300 p-2 mb-4 rounded'
                />
                <button type="submit" className='bg-blue-500 text-white p-2 rounded hover:bg-blue-600'>
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
