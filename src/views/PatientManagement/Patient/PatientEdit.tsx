import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Patient } from '../../../models/Patient';
import { PatientController } from '../../../controllers/PatientController';
import { DiagnosisProcedure } from '../../../models/DiagnosisProcedure';
import { DiagnosisProcedureController } from '../../../controllers/DiagnosisProcedureController';
import { MedicalRecordController } from '../../../controllers/MedicalRecord';
import { MedicalRecord } from '../../../models/MedicalRecord';
import { User } from '../../../models/User';
import { UserController } from '../../../controllers/UserController';

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
    const [descriptionMedicalRecord, setDescriptionMedicalRecord] = useState('');
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [editingDescription, setEditingDescription] = useState('');
    const [isCreatingRecord, setIsCreatingRecord] = useState(false);




    const [hasInsurance, setHasInsurance] = useState(false);
    const [hasHeartDisease, setHasHeartDisease] = useState(false);
    const [hasBloodPressure, setHasBloodPressure] = useState(false);
    const [hasBloodGlucose, setHasBloodGlucose] = useState(false);
    const [hasDiabetes, setHasDiabetes] = useState(false);
    const [hasAllergies, setHasAllergies] = useState(false);
    const [hasEndocrineDisorders, setHasEndocrineDisorders] = useState(false);
    const [hasNeurologicalDisorders, setHasNeurologicalDisorders] = useState(false);
    const [diagnosisProcedures, setDiagnosticProcedures] = useState<DiagnosisProcedure[]>([]);
    const [medicationRecords, setMedicationRecords] = useState<MedicalRecord[]>([]);
    const [users, setUsers] = useState <User[]>([]);

    const diagnosisProcedureController = new DiagnosisProcedureController();
    const medicalRecord = new MedicalRecordController()
    const userController = new UserController();

    const [errors, setErrors] = useState<string[]>([]);



    useEffect(() => {
        if (id && id !== 'new') {
            console.log("🚀 ~ useEffect ~ id:", id)
            

            diagnosisProcedureController.getDiagnosisProcedureByPatient(id).then(procedures => {
                console.log("🚀 ~ test:", procedures);
                setDiagnosticProcedures(procedures);
            }).catch((error) => {
                console.error("Failed to fetch procedures:", error);
            });

            medicalRecord.getMedicalRecordById(id).then(records => {
                console.log("records", records.data);
                setMedicationRecords(records.data);
            }).catch((error) => {console.error("Failed to fetch records:", error);});

            userController.getUsers().then(users => {
                console.log("users", users);
                setUsers(users);
            }).catch((error) => {console.error("Failed to fetch users:", error);});


            controller.getPatient(id).then(patient => {
                console.log("🚀 ~ controller.getPatient ~ patient:", patient);
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
                console.error("Failed to load patient:", error);
            });
        }
    }, [id, controller]);


    const searchDoctor = (id:string): string => {
        const doctor = users.find(user => user.ID === id);
        return doctor? doctor.Name : "";
    }



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
            const savePromises = diagnosisProcedures
                .filter(diagProc => diagProc.ID )
                .map(async diagProc => await diagnosisProcedureController.editDiagnosisProcedure(diagProc));

            if (id !== 'new') {
                await controller.editPatient(patient);
            } else {
                await controller.addPatient(patient);
            }


            await Promise.all(savePromises);

            navigate('/patient-management');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            errors.push(error.message as string);
            setErrors(errors);
            console.error("Failed to save patient or diagnosis procedures", error);
        }
    };

    const handleCreateMedicalRecord = async () => {
        try {
            if (!descriptionMedicalRecord.trim()) {
                setErrors([...errors, "La descripción de la historia médica no puede estar vacía"]);
                return;
            }

            await medicalRecord.addMedicalRecord({
                id_patient: id || '',
                id_user: JSON.parse(localStorage.getItem('id') || ''),
                date: new Date(),
                description: descriptionMedicalRecord,
            });

            // Refresh medical records list
            const updatedRecords = await medicalRecord.getMedicalRecordById(id || '');
            setMedicationRecords(updatedRecords.data);
            
            // Reset form
            setDescriptionMedicalRecord('');
            setIsCreatingRecord(false);
        } catch (error) {
            console.error("Failed to create medical record:", error);
            setErrors([...errors, "Error al crear la historia médica"]);
        }
    };

    const handleEditRecord = async (recordId: number) => {
        try {
            if (!editingDescription.trim()) {
                setErrors([...errors, "La descripción no puede estar vacía"]);
                return;
            }

            await medicalRecord.editPatient({
                id: recordId,
                id_patient: id || '',
                id_user: JSON.parse(localStorage.getItem('id') || ''),
                date: new Date(),
                description: editingDescription,
            });

            // Refresh medical records list
            const updatedRecords = await medicalRecord.getMedicalRecordById(id || '');
            setMedicationRecords(updatedRecords.data);
            
            // Reset editing state
            setEditingRecordId(null);
            setEditingDescription('');
        } catch (error) {
            console.error("Failed to edit medical record:", error);
            setErrors([...errors, "Error al editar la historia médica"]);
        }
    };


    const startEditing = (record: MedicalRecord) => {
        setEditingRecordId(record.id.toString());
        setEditingDescription(record.description);
    };

    const cancelEditing = () => {
        setEditingRecordId(null);
        setEditingDescription('');
    };


    const renderMedicalRecordsSection = () => (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Historias Médicas</h2>
            
            {/* Create New Record Button */}
            {!isCreatingRecord && (
                <button
                    onClick={() => setIsCreatingRecord(true)}
                    className="mb-6 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                >
                    Nueva Historia Médica
                </button>
            )}

            {/* Create New Record Form */}
            {isCreatingRecord && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Nueva Historia Médica</h3>
                    <textarea
                        value={descriptionMedicalRecord}
                        onChange={(e) => setDescriptionMedicalRecord(e.target.value)}
                        className="w-full p-3 border rounded-lg mb-3 min-h-[100px]"
                        placeholder="Ingrese la descripción de la historia médica..."
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateMedicalRecord}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => {
                                setIsCreatingRecord(false);
                                setDescriptionMedicalRecord('');
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Medical Records List */}
            <div className="space-y-4">
                {medicationRecords?.map((record) => (
                    <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Doctor:</span>
                                <span>{searchDoctor(record.id_user)}</span>
                                <span className="text-gray-500">
                                    {new Date(record.date).toLocaleDateString()}
                                </span>
                            </div>
                            {editingRecordId !== record.id.toString() && (
                                <button
                                    onClick={() => startEditing(record)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    Editar
                                </button>
                            )}
                        </div>

                        {editingRecordId === record.id.toString() ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editingDescription}
                                    onChange={(e) => setEditingDescription(e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditRecord(record.id)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-700 whitespace-pre-wrap">{record.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );




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



                <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Crear Historia Médica</h2>
                <textarea
                    value={descriptionMedicalRecord}
                    onChange={(e) => setDescriptionMedicalRecord(e.target.value)}
                    className="border rounded-lg p-2 w-full h-32 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese la descripción de la historia médica..."
                />
                <button
                    onClick={handleCreateMedicalRecord}
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                >
                    Crear Historia Médica
                </button>
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
            {renderMedicalRecordsSection()}
        </div>
    );
};

export default PatientEdit;
