import { Diagnosis } from '../models/Diagnosis';
import {
    fetchDiagnosis,
} from '../services/Diagnosis';

export class DiagnosisController {
    async getDiagnosis(): Promise<Diagnosis[]> {
        try {
            return await fetchDiagnosis();
        } catch (error) {
            console.error('Failed to fetch diagnosiss:', error);
            throw new Error('Could not fetch diagnosiss.');
        }
    }


}
