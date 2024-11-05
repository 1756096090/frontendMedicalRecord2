import { Patient } from '../models/Patient';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/patient`;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Network response was not ok'}`);
    }
    return response.json();
};

export const fetchPatients = async (): Promise<Patient[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

export const fetchPatientById = async (id: string): Promise<Patient> => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
};

export const createPatient = async (patient: Omit<Patient, 'ID'>): Promise<Patient> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(patient),
    });
    return handleResponse(response);
};

export const updatePatient = async (patient: Patient): Promise<Patient> => {
    const response = await fetch(`${API_URL}/${patient.ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(patient),
    });
    return handleResponse(response);
};

export const deletePatient = async (id: string ): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};