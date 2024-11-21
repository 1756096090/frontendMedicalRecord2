export interface Schedule {
    ID?: string;
    Date: Date;
    IDUser: string;
    IDPatient: string;
    StartAppointment: Date;
    EndAppointment: Date;
    StartOrignal: Date;
    Text: string;
}