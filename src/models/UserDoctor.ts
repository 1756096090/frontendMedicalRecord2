import { Role } from "./Role";
import { Specialist } from "./Specialist";

export interface Doctor{
    ID:         string;
    Email:      string;
    Name:       string;
    Phone:      string;
    Address:    string;
    Gender:     string;
    DNI:        string;
    Password:   string;
    BirthDate:  Date;
    RoleID:       string;
    SpecialistID: string;
    HasAccess:  boolean;
    Role: Role;
    Specialist: Specialist;

}