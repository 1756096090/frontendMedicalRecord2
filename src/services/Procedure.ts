import { Procedure } from '../models/Procedure';
import config from '../config';
import { handleResponse } from './handleResponse';

const API_URL = `${config.API_BASE_URL}/procedure`;



export const fetchProcedures = async (): Promise<Procedure[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

