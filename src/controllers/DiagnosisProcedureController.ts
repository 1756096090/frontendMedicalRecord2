import { DiagnosisProcedure } from '../models/DiagnosisProcedure';
import {
    fetchDiagnosisProcedures,
    createDiagnosisProcedure,
    updateDiagnosisProcedure,
    deleteDiagnosisProcedure,
    fetchDiagnosisProcedureById,
    fetchDiagnosisProcedureByPatient
} from '../services/diagnosisProcedure';

export class DiagnosisProcedureController {
    async getDiagnosisProcedures(): Promise<DiagnosisProcedure[]> {
        try {
            return await fetchDiagnosisProcedures();
        } catch (error) {
            console.error('Failed to fetch diagnosisProcedures:', error);
            throw new Error('Could not fetch diagnosisProcedures.');
        }
    }

    async getDiagnosisProcedure(id: string): Promise<DiagnosisProcedure> {
        try {
            return await fetchDiagnosisProcedureById(id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error(`Failed to fetch diagnosisProcedure with ID ${id}:`, error);
            throw new Error(error);
        }
    }

    async getDiagnosisProcedureByPatient(IDPatient: string): Promise<DiagnosisProcedure[]> {
        try {
            return await fetchDiagnosisProcedureByPatient(IDPatient);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error(`Failed to fetch diagnosisProcedure with ID ${IDPatient}:`, error);
            throw new Error(error);
        }
    }

    async addDiagnosisProcedure(diagnosisProcedure: Omit<DiagnosisProcedure, 'ID'>): Promise<string> {
        try {
            const createdDiagnosisProcedure = await createDiagnosisProcedure(diagnosisProcedure);
            return createdDiagnosisProcedure;
        } catch (error) {
            console.error('Failed to create diagnosisProcedure:', error);
            if (error instanceof Error) {
                throw new Error(`Could not create diagnosisProcedure: ${error.message}`);
            } else {
                throw new Error('Could not create diagnosisProcedure due to an unknown error.');
            }
        }
    }
    

    async editDiagnosisProcedure(diagnosisProcedure: DiagnosisProcedure): Promise<DiagnosisProcedure> {
        try {
            return await updateDiagnosisProcedure(diagnosisProcedure);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error('Failed to update diagnosisProcedure:', error);
            throw new Error(error.message);
        }
    }

    async removeDiagnosisProcedure(id: string): Promise<void> {
        try {
            await deleteDiagnosisProcedure(id);
        } catch (error) {
            console.error(`Failed to delete diagnosisProcedure with ID ${id}:`, error);
            throw new Error('Could not delete diagnosisProcedure.');
        }
    }

}
