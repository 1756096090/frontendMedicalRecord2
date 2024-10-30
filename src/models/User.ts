export interface User {
    ID:         string;
    Email:      string;
    Name:       string;
    Phone:      string;
    Address:    string;
    Gender:     string;
    DNI:        string;
    Password:   string;
    BirthDate:  Date;
    Role:       RoleUser;
    Specialist: SpecialistUser;
    HasAccess:  boolean;
}

export interface RoleUser {
    Name:        string;
    Permissions: string[];
}

export interface SpecialistUser {
    Specialization:    string;
    Description:       string;
    YearsOfExperience: number;
}
