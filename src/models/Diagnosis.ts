export interface Diagnosis {
    ID : string;
    Code: string;
    Description: string;
    UnderDiagnosis: UnderDiagnosis[];
  }
  
  export interface UnderDiagnosis {
    Code: string;
    Description: string;
  }
  