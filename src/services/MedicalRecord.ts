import { CreateInfo } from '../models/CreateInfo';
import { MedicalRecord } from '../models/MedicalRecord';
import { handleResponse } from './handleResponse';

const API_URL = `http://40.76.113.138:9090/`;



export const fetchMedicalRecordByPatientId = async (id: string): Promise<unknown> => {
    const response = await fetch(`${API_URL}patient/${id}`);
    return handleResponse(response);
};

export const createMedicalRecord = async (medicalRecord: Omit<MedicalRecord, 'id'>): Promise<CreateInfo> => {
    const response = await fetch( `${API_URL}create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicalRecord),
    });
    return handleResponse(response);
};

export const updateMedicalRecord = async (medicalRecord: MedicalRecord): Promise<string> => {
    const response = await fetch(`${API_URL}edit/${medicalRecord.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({description: medicalRecord.description}),
    });
    return handleResponse(response);
};

