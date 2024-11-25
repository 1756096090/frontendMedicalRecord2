import { Patient } from './Patient';
import { User } from './User';
export interface Schedule {
    ID?: string;
    Date: Date;
    IDUser: string;
    IDPatient: string;
    StartAppointment: Date;
    EndAppointment: Date;
    StartOrignal: Date  | null;
    Text: string;
}

export interface ScheduleDetails  extends Schedule {

    Patient: Patient;
    User: User;
    
}