import React from 'react';
import { Patient } from '../../../models/Patient';

interface PatientListViewProps {
    patients: Patient[];
    onEdit: (id: string) => void;
}

const PatientListView: React.FC<PatientListViewProps> = ({ patients, onEdit }) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString();
    };



    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Nombre</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Fecha de Nacimiento</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Género</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Motivo de Consulta</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Correo</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Teléfono</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Ocupación</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Responsable</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Condiciones Médicas</th>
                        <th className="border border-gray-200 p-2 bg-gray-50" scope="col">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient) => (
                        <tr key={patient.ID} className="hover:bg-gray-50">
                            <td className="border border-gray-200 p-2">{patient.Name}</td>
                            <td className="border border-gray-200 p-2">{formatDate(patient.BirthDate)}</td>
                            <td className="border border-gray-200 p-2">{patient.Gender ? 'Masculino' : 'Femenino'}</td>
                            <td className="border border-gray-200 p-2">{patient.Concerning}</td>
                            <td className="border border-gray-200 p-2">{patient.Mail}</td>
                            <td className="border border-gray-200 p-2">{patient.Phone}</td>
                            <td className="border border-gray-200 p-2">{patient.Occupation}</td>
                            <td className="border border-gray-200 p-2">{patient.Responsible}</td>
                            <td className="border border-gray-200 p-2">
                                <div className="text-sm">
                                    {patient.HasInsurance && <div>• Seguro Médico</div>}
                                    {patient.HasHeartDisease && <div>• Enfermedad Cardíaca</div>}
                                    {patient.HasBloodPressure && <div>• Presión Arterial</div>}
                                    {patient.HasBloodGlucose && <div>• Glucosa en Sangre</div>}
                                    {patient.HasDiabetes && <div>• Diabetes</div>}
                                    {patient.HasAllergies && <div>• Alergias</div>}
                                    {patient.HasEndocrineDisorders && <div>• Trastornos Endocrinos</div>}
                                    {patient.HasNeurologicalDisorders && <div>• Trastornos Neurológicos</div>}
                                    {patient.Others && <div>• Otros: {patient.Others}</div>}
                                </div>
                            </td>
                            <td className="border border-gray-200 p-2">
                                <button
                                    onClick={() => onEdit(patient.ID)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-400 transition-colors"
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PatientListView;