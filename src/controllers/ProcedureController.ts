import { Procedure } from '../models/Procedure';
import {
    fetchProcedures,
} from '../services/Procedure';

export class ProcedureController {
    async getProcedures(): Promise<Procedure[]> {
        try {
            return await fetchProcedures();
        } catch (error) {
            console.error('Failed to fetch procedures:', error);
            throw new Error('Could not fetch procedures.');
        }
    }


}
