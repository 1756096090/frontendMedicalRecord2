import { DiagnosisProcedure } from '../models/DiagnosisProcedure';
import config from '../config';
import { handleResponse } from './handleResponse';
import { ReportCore } from '../models/ReportCore';

const API_URL = `${config.API_BASE_URL}/diagnosisProcedure`;


export const fetchDiagnosisProcedures = async (): Promise<DiagnosisProcedure[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

export const fetchDiagnosisProcedureById = async (id: string): Promise<DiagnosisProcedure> => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
};

export const fetchDiagnosisProcedureByPatient = async (IDPatient: string): Promise<DiagnosisProcedure[]> => {
    const response = await fetch(`${API_URL}/by-patient`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({IDPatient}),
    });
    return handleResponse(response);
    console.log("🚀 ~ fetchDiagnosisProcedureByPatient ~ response:", response)
};

interface InsertedResponse {
    InsertedID: string;
}

export const createDiagnosisProcedure = async (diagnosisProcedure: Omit<DiagnosisProcedure, 'ID'>): Promise<string> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosisProcedure),
    });

    const result: InsertedResponse = await handleResponse(response);
    return result.InsertedID;
};


export const updateDiagnosisProcedure = async (diagnosisProcedure: DiagnosisProcedure): Promise<DiagnosisProcedure> => {
    const response = await fetch(`${API_URL}/${diagnosisProcedure.ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosisProcedure),
    });
    return handleResponse(response);
};

export const deleteDiagnosisProcedure = async (id: string ): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};


export const generateCoreReport = async (IDProcedure: string, IDPatient: string ): Promise<ReportCore> => {
    const response = await fetch(`${API_URL}/report`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({IDPatient, IDProcedure}),
    });
    return handleResponse(response);
};

