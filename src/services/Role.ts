import { Role } from '../models/Role';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/role`;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Network response was not ok'}`);
    }
    return response.json();
};

export const fetchRoles = async (): Promise<Role[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

