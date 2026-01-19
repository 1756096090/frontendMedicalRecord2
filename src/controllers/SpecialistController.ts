import { Specialist } from '../models/Specialist';
import {
    fetchSpecialists,
    createSpecialist,
    updateSpecialist,
    deleteSpecialist,
    fetchSpecialistById,
} from '../services/Specialist';

export class SpecialistController {
    async getSpecialists(): Promise<Specialist[]> {
        try {
            return await fetchSpecialists();
        } catch (error) {
            console.error('Failed to fetch specialists:', error);
            throw new Error('Could not fetch specialists.');
        }
    }

    async getSpecialist(id: string): Promise<Specialist> {
        try {
            return await fetchSpecialistById(id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error(`Failed to fetch specialist with ID ${id}:`, error);
            throw new Error(error);
        }
    }

    async addSpecialist(specialist: Omit<Specialist, 'id'>): Promise<Specialist> {
        try {
            return await createSpecialist(specialist);
        } catch (error) {
            console.error('Failed to create specialist:', error);
            throw new Error('Could not create specialist.');
        }
    }

    async editSpecialist(specialist: Specialist): Promise<Specialist> {
        try {
            return await updateSpecialist(specialist);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error('Failed to update specialist:', error);
            throw new Error(error.message);
        }
    }

    async removeSpecialist(id: string): Promise<void> {
        try {
            await deleteSpecialist(id);
        } catch (error) {
            console.error(`Failed to delete specialist with ID ${id}:`, error);
            throw new Error('Could not delete specialist.');
        }
    }

}
