

export interface DiagnosisProcedure {
    ID?: string;
    IDPatient: string;
    CodeDiagnosis: string;
    CodeUnderDiagnosis: string;
    Procedures: ProcedureDetails[];

}

export interface ProcedureDetails {
    IDProcedure: string;
    IDCreator: string;
    IDUpdater: string;
    Description: string;
    StartAt: Date | null | string;
    EndAt: Date | null | string;
    IsCompleted: boolean;
}
