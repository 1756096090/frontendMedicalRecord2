export interface ReportCore {
    CodeUnderDiagnosis: string;
    IsTimeType: boolean;
    AverageProcedureTime: number;
    AveragePatientAge: number;
    AveragePatientGender: number;
    AverageAppointmen: number;
    SimilarPatients: SimilarPatient[] | null;
    SuccessfulTreatments: number;
    TotalProcedureCount: number;
}

export interface SimilarPatient {
    Patient: Patient;
    TotalDays: number;
    Count: number;
    IsSuccessful: boolean;
}

export interface Patient {
    ID: string;
    Name: string;
    BirthDate: Date | string;
    Gender: boolean;
    Concerning: string;
    Mail: string;
    DNI: string;
    Phone: string;
    Occupation: string;
    Responsible: string;
    HasInsurance: boolean;
    HasHeartDisease: boolean;
    HasBloodPressure: boolean;
    HasBloodGlucose: boolean;
    HasDiabetes: boolean;
    HasAllergies: boolean;
    HasEndocrineDisorders: boolean;
    HasNeurologicalDisorders: boolean;
    Others: string;
}
