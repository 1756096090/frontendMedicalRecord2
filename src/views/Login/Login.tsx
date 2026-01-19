/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlag } from '@unleash/proxy-client-react';
import { UserController } from '../../controllers/UserController'; 
import './Login.css';

/**
 * Login Component con LaunchDarkly Feature Flags
 * 
 * Feature Flag: 'new-login-design'
 * - OFF (false): Muestra el diseño clásico de login
 * - ON (true): Muestra el nuevo diseño mejorado con animaciones y mejor UX
 * 
 * Estrategia: Canary Release - desplegar el nuevo diseño gradualmente
 */
const Login: React.FC = () => {
    const [controller] = useState(new UserController());
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>(''); 
    const navigate = useNavigate();
    
    // Feature Flag de Unleash
    const useNewDesign = useFlag('new-login-design');
    
    console.log('[Unleash] new-login-design:', useNewDesign);

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

    // VERSIÓN CLÁSICA - Flag OFF
    if (!useNewDesign) {
        return (
            <div className='flex flex-col items-center mt-20'>
                <form onSubmit={handleSubmit} className='classic-login-form'>
                    <h1 className='font-bold text-center mb-5 text-gray-800 border-b border-gray-300'>Login</h1>
                    <p>Ingrese las credenciales para acceder al sitio</p>
                    {error && <p className='text-red-500'>{error}</p>}
                    <div className='flex flex-col'>
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
                    </div>
                    {/* Indicador de versión */}
                    <div className='text-xs text-gray-400 mt-4 text-center'>
                        Version: Classic
                    </div>
                </form>
            </div>
        );
    }

    // NUEVA VERSIÓN - Flag ON
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'>
            <div className='new-login-container bg-white rounded-2xl shadow-2xl p-8 w-96 transform transition-all hover:scale-105'>
                <div className='text-center mb-6'>
                    <div className='inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4'>
                        <svg className='w-12 h-12 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                    </div>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>¡Bienvenido!</h1>
                    <p className='text-gray-600'>Nuevo diseño mejorado con LaunchDarkly</p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {error && (
                        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded animate-pulse'>
                            <p className='text-sm'>{error}</p>
                        </div>
                    )}
                    
                    <div className='relative'>
                        <label className='text-sm font-semibold text-gray-700 mb-1 block'>Usuario</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className='w-full border-2 border-gray-300 p-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none'
                        />
                    </div>

                    <div className='relative'>
                        <label className='text-sm font-semibold text-gray-700 mb-1 block'>Contraseña</label>
                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full border-2 border-gray-300 p-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none'
                        />
                    </div>

                    <button 
                        type="submit" 
                        className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transform transition-all hover:scale-105 active:scale-95 shadow-lg'
                    >
                        Iniciar Sesión 🚀
                    </button>

                    {/* Badge de nueva versión */}
                    <div className='flex items-center justify-center space-x-2 mt-4'>
                        <span className='inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full'>
                            ✨ NEW DESIGN
                        </span>
                        <span className='text-xs text-gray-400'>Powered by LaunchDarkly</span>
                    </div>
                </form>
            </div>
            
            {/* Indicador flotante del feature flag */}
            <div className='fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-bounce'>
                🚀 NEW VERSION ACTIVE
            </div>
        </div>
    );
};

export default Login;
