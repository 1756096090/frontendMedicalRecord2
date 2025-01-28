/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedicalRecord } from '../models/MedicalRecord';
import {
    fetchMedicalRecordByPatientId,
    createMedicalRecord,
    updateMedicalRecord,

} from '../services/MedicalRecord';
import { CreateInfo } from '../models/CreateInfo';

export class MedicalRecordController {


    async getMedicalRecordById(id: string): Promise<any> {
        try {
            return await fetchMedicalRecordByPatientId(id);
        } catch (error) {
            console.error(`Failed to fetch patient with ID ${id}:`, error);
            throw new Error('Could not fetch patient.');
        }
    }

    async addMedicalRecord(medicalRecord: Omit<MedicalRecord, 'id'>): Promise<CreateInfo> {
        try {
            return await createMedicalRecord(medicalRecord);
        } catch (error) {
            console.error('Failed to create patient:', error);
            throw new Error('Could not create patient.');
        }
    }

    async editPatient(medicalRecord: MedicalRecord): Promise<string> {
        try {
            return await updateMedicalRecord(medicalRecord);
        } catch (error:any) {
            console.error('Failed to update patient:', error);
            throw new Error(error.message);
        }
    }

 

}
