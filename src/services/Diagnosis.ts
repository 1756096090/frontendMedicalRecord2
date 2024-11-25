import { Diagnosis } from '../models/Diagnosis';
import config from '../config';
import { handleResponse } from './handleResponse';

const API_URL = `${config.API_BASE_URL}/diagnosis`;


export const fetchDiagnosis = async (): Promise<Diagnosis[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

