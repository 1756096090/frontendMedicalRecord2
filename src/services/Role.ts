import { Role } from '../models/Role';
import config from '../config';
import { handleResponse } from './handleResponse';

const API_URL = `${config.API_BASE_URL}/role`;



export const fetchRoles = async (): Promise<Role[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

