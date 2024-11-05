export interface Patient {
    ID:                       string;
    Name:                     string;
    BirthDate:                Date;
    Gender:                   boolean;
    Concerning:               string;
    Mail:                     string;
    Phone:                    string;
    Occupation:               string;
    Responsible:              string;
    HasInsurance:             boolean;
    HasHeartDisease:          boolean;
    HasBloodPressure:         boolean;
    HasBloodGlucose:          boolean;
    HasDiabetes:              boolean;
    HasAllergies:             boolean;
    HasEndocrineDisorders:    boolean;
    HasNeurologicalDisorders: boolean;
    Others:                   string;
}
