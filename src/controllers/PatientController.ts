/* eslint-disable @typescript-eslint/no-explicit-any */
import { Patient } from '../models/Patient';
import {
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    fetchPatientById,
} from '../services/Patient';

export class PatientController {
    async getPatients(): Promise<Patient[]> {
        try {
            return await fetchPatients();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error('Failed to fetch patients:', error);
            throw new Error(error);
        }
    }

    async getPatient(id: string): Promise<Patient> {
        try {
            return await fetchPatientById(id);
        } catch (error) {
            console.error(`Failed to fetch patient with ID ${id}:`, error);
            throw new Error('Could not fetch patient.');
        }
    }

    async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
        try {
            return await createPatient(patient);
        } catch (error) {
            console.error('Failed to create patient:', error);
            throw new Error('Could not create patient.');
        }
    }

    async editPatient(patient: Patient): Promise<Patient> {
        try {
            return await updatePatient(patient);
        } catch (error:any) {
            console.error('Failed to update patient:', error);
            throw new Error(error.message);
        }
    }

    async removePatient(id: string): Promise<void> {
        try {
            await deletePatient(id);
        } catch (error) {
            console.error(`Failed to delete patient with ID ${id}:`, error);
            throw new Error('Could not delete patient.');
        }
    }

}
