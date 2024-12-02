import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Patient } from '../../../models/Patient';
import { PatientController } from '../../../controllers/PatientController';
import { DiagnosisProcedure, ProcedureDetails } from '../../../models/DiagnosisProcedure';
import { Diagnosis } from '../../../models/Diagnosis';
import { DiagnosisProcedureController } from '../../../controllers/DiagnosisProcedureController';
import { ProcedureController } from '../../../controllers/ProcedureController';
import { Procedure } from '../../../models/Procedure';

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
    const [diagnosis, setDiagnosis] = useState<Diagnosis[]>([]);
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [idDiagnosis, setIdDiagnosis] = useState<string>("");
    const [idSubDiagnosis, setIdSubDiagnosis] = useState<string>("")
    const [diagnosisProcedures, setDiagnosticProcedures] = useState<DiagnosisProcedure[]>([]);
    const [modifiedDiagnosisProcedures, setModifiedDiagnosisProcedures] = useState<Set<string>>(new Set());

    const diagnosisProcedureController = new DiagnosisProcedureController();
    const procedureController = new ProcedureController()


    const [errors, setErrors] = useState<string[]>([]);


    useEffect(() => {
        if (id && id !== 'new') {
            console.log("🚀 ~ useEffect ~ id:", id)
            const storedDiagnosis = localStorage.getItem("diagnosis");
            if (storedDiagnosis) {
                setDiagnosis(JSON.parse(storedDiagnosis));
            }

            diagnosisProcedureController.getDiagnosisProcedureByPatient(id).then(procedures => {
                console.log("🚀 ~ diagnosisProcedureController.getDiagnosisProcedureByPatient ~ procedures:", procedures);
                setDiagnosticProcedures(procedures);
            }).catch((error) => {
                console.error("Failed to fetch procedures:", error);
            });
            procedureController.getProcedures().then(procedures => {
                console.log("��� ~ procedureController.getProcedures ~ procedures:", procedures);
                setProcedures(procedures);
            }).catch((error) => {
                console.error("Failed to fetch procedures:", error);
            })

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

    const handleDiagnosisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDiagnosis = e.target.value
        setIdDiagnosis(selectedDiagnosis);
    }
    const handleSubDiagnosisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSubDiagnosis = e.target.value
        setIdSubDiagnosis(selectedSubDiagnosis);
    }

    const handleSaveDiagnostic = async () => {
        if (id) {
            const diagnosisProcedureSave: DiagnosisProcedure = {
                IDPatient: id,
                CodeDiagnosis: idDiagnosis,
                CodeUnderDiagnosis: idSubDiagnosis,
                Procedures: []
            }

            const savedDiagnosisProcedure = await diagnosisProcedureController.addDiagnosisProcedure(diagnosisProcedureSave);

            if (savedDiagnosisProcedure) {
                console.log("🚀 ~ handleSaveDiagnostic ~ savedDiagnosisProcedure:", savedDiagnosisProcedure)
                diagnosisProcedureSave.ID = savedDiagnosisProcedure; // Use the returned ID from the save operation
                setDiagnosticProcedures([...diagnosisProcedures, diagnosisProcedureSave]);
                
            }
        }
    }
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
                .filter(diagProc => diagProc.ID && modifiedDiagnosisProcedures.has(diagProc.ID))
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


    const handleProcedureChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        diagnosisIndex: number,
        procedureIndex: number,
        field: keyof ProcedureDetails
    ) => {
        const updatedDiagnosisProcedures = [...diagnosisProcedures];
        const currentDiagnosis = updatedDiagnosisProcedures[diagnosisIndex];

        if (field === 'StartAt' || field === 'EndAt') {
            currentDiagnosis.Procedures[procedureIndex][field] =
                e.target.value ? new Date(e.target.value) : null;
        } else if (field === 'IsCompleted') {
            currentDiagnosis.Procedures[procedureIndex][field] = e.target.checked;
        } else {
            currentDiagnosis.Procedures[procedureIndex][field] = e.target.value;
        }

        if (currentDiagnosis.ID) {
            setModifiedDiagnosisProcedures(prev => new Set(prev).add(currentDiagnosis.ID!));
        }

        setDiagnosticProcedures(updatedDiagnosisProcedures);
    };


    const handleProcedureSelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
        diagnosisIndex: number,
        procedureIndex: number,
    ) => {
        const updatedDiagnosisProcedures = [...diagnosisProcedures];
        const currentDiagnosis = updatedDiagnosisProcedures[diagnosisIndex];

        currentDiagnosis.Procedures[procedureIndex].IDProcedure = e.target.value;

        if (currentDiagnosis.ID) {
            setModifiedDiagnosisProcedures(prev => new Set(prev).add(currentDiagnosis.ID!));
        }

        setDiagnosticProcedures(updatedDiagnosisProcedures);
    };


    const handleAddProcedure = (diagnosisIndex: number) => {
        const updatedDiagnosisProcedures = [...diagnosisProcedures];
        const idDoctor = localStorage.getItem('id')

        const newProcedure: ProcedureDetails = {
            IDProcedure: '',
            Description: '',
            StartAt: null,
            EndAt: null,
            IsCompleted: false,
            IDCreator: idDoctor || '',
            IDUpdater: '',
        };

        updatedDiagnosisProcedures[diagnosisIndex].Procedures.push(newProcedure);
        setDiagnosticProcedures(updatedDiagnosisProcedures);
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
                <div>
                    <h3>Agregar nuevo diagnóstico</h3>
                    <select
                        name="idDiagnosis"
                        value={idDiagnosis}
                        onChange={handleDiagnosisChange}
                        className="border rounded p-2 w-full"
                    >
                        <option value="">Seleccionar Diagnóstico</option>
                        {diagnosis.map((diagnosis) => (
                            <option key={diagnosis.Code} value={diagnosis.Code}>
                                {diagnosis.Description.length > 50
                                    ? diagnosis.Description.slice(0, 50) + "..."
                                    : diagnosis.Description}
                            </option>
                        ))}
                    </select>

                    {idDiagnosis !== "" && (
                        <select
                            name="SpecialistID"
                            value={idSubDiagnosis}
                            onChange={handleSubDiagnosisChange}
                            className="border rounded p-2 w-full"
                        >
                            <option value="">Seleccionar Subdiagnóstico</option>
                            {
                                diagnosis
                                    .filter((d) => d.Code == idDiagnosis)
                                    .map((diagnosis) => (
                                        diagnosis.UnderDiagnosis?.map((underDiagnosis, index) => (
                                            <option key={index} value={underDiagnosis.Code}>
                                                {underDiagnosis.Description.length > 50
                                                    ? underDiagnosis.Description.slice(0, 50) + "..."
                                                    : underDiagnosis.Description}
                                            </option>
                                        ))
                                    ))
                            }
                        </select>
                    )}

                    {idDiagnosis != "" && idDiagnosis != "" && <button
                        onClick={handleSaveDiagnostic}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    >
                        Agregar Diagnóstico
                    </button>}

                </div>

                <div className="p-6 bg-gray-50 min-h-screen">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {diagnosisProcedures && diagnosisProcedures.map((d, index) => (
                            <div
                                key={index}
                                className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500"
                            >
                                <h3 className="text-xl font-bold text-gray-800 mb-4">
                                    Diagnóstico {index + 1}
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Paciente:</span> {d.IDPatient}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Código Diagnóstico:</span> {d.CodeDiagnosis}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Código Subdiagnóstico:</span> {d.CodeUnderDiagnosis}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Procedimientos</h4>

                                    {d.Procedures.length > 0 ? (
                                        <div className="space-y-4">
                                            {d.Procedures.map((procedure, procedureIndex) => (
                                                <div
                                                    key={procedureIndex}
                                                    className="bg-gray-100 p-4 rounded-md"
                                                >
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>

                                                            <select
                                                                name="Procedimiento"
                                                                value={procedure.IDProcedure}
                                                                onChange={(e) => handleProcedureSelectChange(e, index, procedureIndex)}
                                                                className="border rounded p-2 w-full"
                                                            >
                                                                <option value="">Seleccionar Diagnóstico</option>
                                                                {procedures.map((procedure) => (
                                                                    <option key={procedure.ID} value={procedure.ID}>
                                                                        {procedure.Description.length > 30
                                                                            ? procedure.Description.slice(0, 30) + "..."
                                                                            : procedure.Description}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Descripción
                                                                <input
                                                                    type="text"
                                                                    value={procedure.Description}
                                                                    onChange={(e) => handleProcedureChange(e, index, procedureIndex, 'Description')}
                                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>


                                                    {procedures.find((pro)=>pro.ID == diagnosisProcedures[index].Procedures[procedureIndex].IDProcedure)?.IsTimeType &&  <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Fecha de Inicio
                                                                <input
                                                                    type="datetime-local"
                                                                    value={
                                                                        typeof procedure.StartAt === 'string'
                                                                            ? procedure.StartAt.slice(0, 16)
                                                                            : procedure.StartAt instanceof Date
                                                                                ? procedure.StartAt.toISOString().slice(0, 16)
                                                                                : ''
                                                                    }
                                                                    onChange={(e) => handleProcedureChange(e, index, procedureIndex, 'StartAt')}
                                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                                />
                                                            </label>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Fecha de Fin
                                                                <input
                                                                    type="datetime-local"
                                                                    value={
                                                                        typeof procedure.EndAt === 'string'
                                                                            ? procedure.EndAt.slice(0, 16)
                                                                            : procedure.EndAt instanceof Date
                                                                                ? procedure.EndAt.toISOString().slice(0, 16)
                                                                                : ''
                                                                    }
                                                                    onChange={(e) => handleProcedureChange(e, index, procedureIndex, 'EndAt')}
                                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                                />
                                                            </label>
                                                        </div>

                                                    </div>}

                                                    {!procedures.find((pro)=>pro.ID == diagnosisProcedures[index].Procedures[procedureIndex].IDProcedure)?.IsTimeType &&<div className="mt-4">
                                                        <label className="inline-flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={procedure.IsCompleted}
                                                                onChange={(e) => handleProcedureChange(e, index, procedureIndex, 'IsCompleted')}
                                                                className="rounded text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Completado</span>
                                                        </label>
                                                    </div>}
                                                </div>
                                            ))}

                                        </div>

                                    ) : (
                                        <p className="text-gray-500 italic">No hay procedimientos registrados.</p>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <button
                                        onClick={() => handleAddProcedure(index)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                                    >
                                        Añadir Procedimiento
                                    </button>
                                </div>
                            </div>
                        ))}
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
