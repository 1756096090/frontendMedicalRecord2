// src/services/userService.ts
import { User } from '../models/User';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/user`;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Network response was not ok'}`);
    }
    return response.json();
};

export const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

export const fetchUserById = async (id: string): Promise<User> => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
};

export const createUser = async (user: Omit<User, 'ID'>): Promise<User> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    return handleResponse(response);
};

export const updateUser = async (user: User): Promise<User> => {
    const response = await fetch(`${API_URL}/${user.ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    return handleResponse(response);
};

export const deleteUser = async (id: string ): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

export const login = async (email: string, password: string): Promise<string> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    return data; 
};