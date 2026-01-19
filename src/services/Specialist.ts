import { Specialist } from '../models/Specialist';
import config from '../config';
import { handleResponse } from './handleResponse';

const API_URL = `${config.API_BASE_URL}/specialist`;


export const fetchSpecialists = async (): Promise<Specialist[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

export const fetchSpecialistById = async (id: string): Promise<Specialist> => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
};

export const createSpecialist = async (specialist: Omit<Specialist, 'ID'>): Promise<Specialist> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(specialist),
    });
    return handleResponse(response);
};

export const updateSpecialist = async (specialist: Specialist): Promise<Specialist> => {
    const response = await fetch(`${API_URL}/${specialist.ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(specialist),
    });
    return handleResponse(response);
};

export const deleteSpecialist = async (id: string ): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};