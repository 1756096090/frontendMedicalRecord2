import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Patient } from '../../../models/Patient';
import { PatientController } from '../../../controllers/PatientController';

const PatientEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [controller] = useState(new PatientController());

    // Form state
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<boolean>(true);
    const [concerning, setConcerning] = useState('');
    const [mail, setMail] = useState('');
    const [dni, setDni] = useState('');
    const [phone, setPhone] = useState('');
    const [occupation, setOccupation] = useState('');
    const [responsible, setResponsible] = useState('');
    const [others, setOthers] = useState('');

    const [hasInsurance, setHasInsurance] = useState(false);
    const [hasHeartDisease, setHasHeartDisease] = useState(false);
    const [hasBloodPressure, setHasBloodPressure] = useState(false);
    const [hasBloodGlucose, setHasBloodGlucose] = useState(false);
    const [hasDiabetes, setHasDiabetes] = useState(false);
    const [hasAllergies, setHasAllergies] = useState(false);
    const [hasEndocrineDisorders, setHasEndocrineDisorders] = useState(false);
    const [hasNeurologicalDisorders, setHasNeurologicalDisorders] = useState(false);

    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (id && id !== 'new') {
            controller.getPatient(id).then(patient => {
                setName(patient.Name);
                setBirthDate(new Date(patient.BirthDate).toISOString().split('T')[0]);
                setGender(patient.Gender);
                setConcerning(patient.Concerning);
                setDni(patient.DNI);
                setMail(patient.Mail);
                setPhone(patient.Phone);
                setOccupation(patient.Occupation);
                setResponsible(patient.Responsible);
                setOthers(patient.Others);
                
                setHasInsurance(patient.HasInsurance);
                setHasHeartDisease(patient.HasHeartDisease);
                setHasBloodPressure(patient.HasBloodPressure);
                setHasBloodGlucose(patient.HasBloodGlucose);
                setHasDiabetes(patient.HasDiabetes);
                setHasAllergies(patient.HasAllergies);
                setHasEndocrineDisorders(patient.HasEndocrineDisorders);
                setHasNeurologicalDisorders(patient.HasNeurologicalDisorders);
            }).catch(error => {
                console.error("Failed to load patient", error);
            });
        }
    }, [id, controller]);

    const validateForm = (): boolean => {
        const validationErrors: string[] = [];

        if (!name.trim()) {
            validationErrors.push("El nombre no puede estar vacío.");
        }
        if (!birthDate) {
            validationErrors.push("La fecha de nacimiento es requerida.");
        }
        if (!mail.trim()) {
            validationErrors.push("El correo electrónico es requerido.");
        }
        if (!phone.trim()) validationErrors.push("El teléfono es requerido.");
        if (dni.length < 10 || dni.length > 13) errors.push("El DNI debe tener entre 10 y 13 dígitos.");
        
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (mail && !emailRegex.test(mail)) {
            validationErrors.push("El correo electrónico no es válido.");
        }
        


        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const patient: Patient = {
            ID: id !== 'new' ? id || '' : '',
            Name: name,
            BirthDate: new Date(birthDate),
            Gender: gender,
            Concerning: concerning,
            Mail: mail,
            Phone: phone,
            DNI: dni,
            Occupation: occupation,
            Responsible: responsible,
            HasInsurance: hasInsurance,
            HasHeartDisease: hasHeartDisease,
            HasBloodPressure: hasBloodPressure,
            HasBloodGlucose: hasBloodGlucose,
            HasDiabetes: hasDiabetes,
            HasAllergies: hasAllergies,
            HasEndocrineDisorders: hasEndocrineDisorders,
            HasNeurologicalDisorders: hasNeurologicalDisorders,
            Others: others
        };

        try {
            if (id !== 'new') {
                await controller.editPatient(patient);
            } else {
                await controller.addPatient(patient);
            }
            navigate('/patient-management');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            errors.push(error.message as string);
            setErrors(errors);
            console.error("Failed to save patient", error);
        }
    };

    const handleReturn = () => {
        navigate('/patient-management');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-6">
                {id === 'new' ? 'Crear Paciente' : 'Editar Paciente'}
            </h1>

            {/* Show validation errors */}
            {errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <h2 className="font-bold">Errores de validación:</h2>
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={gender.toString()}
                        onChange={(e) => setGender(e.target.value === 'true')}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="true">Masculino</option>
                        <option value="false">Femenino</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Motivo de consulta"
                        value={concerning}
                        onChange={(e) => setConcerning(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="DNI"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="tel"
                        placeholder="Teléfono"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Ocupación"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Responsable"
                        value={responsible}
                        onChange={(e) => setResponsible(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Medical Conditions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Condiciones Médicas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={hasInsurance}
                                onChange={(e) => setHasInsurance(e.target.checked)}
                                className="rounded"
                            />
                            <span>Seguro Médico</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={hasHeartDisease}
                                onChange={(e) => setHasHeartDisease(e.target.checked)}
                                className="rounded"
                            />
                            <span>Enfermedad Cardíaca</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={hasBloodPressure}
                                onChange={(e) => setHasBloodPressure(e.target.checked)}
                                className="rounded"
                            />
                            <span>Presión Arterial</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={hasBloodGlucose}
                                onChange={(e) => setHasBloodGlucose(e.target.checked)}
                                className="rounded"
                            />
                            <span>Glucosa en Sangre</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={hasDiabetes}
                                onChange={(e) => setHasDiabetes(e.target.checked)}
                                className="rounded"
                            />
                            <span>Diabetes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={hasAllergies}
                                onChange={(e) => setHasAllergies(e.target.checked)}
                                className="rounded"
                            />
                            <span>Alergias</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={hasEndocrineDisorders}
                                onChange={(e) => setHasEndocrineDisorders(e.target.checked)}
                                className="rounded"
                            />
                            <span>Trastornos Endocrinos</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={hasNeurologicalDisorders}
                                onChange={(e) => setHasNeurologicalDisorders(e.target.checked)}
                                className="rounded"
                            />
                            <span>Trastornos Neurológicos</span>
                        </label>
                    </div>
                    <div className="mt-4">
                        <textarea
                            placeholder="Otros detalles médicos"
                            value={others}
                            onChange={(e) => setOthers(e.target.value)}
                            className="border rounded-lg p-2 w-full h-24 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={handleReturn}
                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
                    >
                        Regresar
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientEdit;
