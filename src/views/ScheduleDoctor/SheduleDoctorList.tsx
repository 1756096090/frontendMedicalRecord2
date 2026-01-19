import React from 'react';
import { ScheduleDetails } from '../../models/Schedule';

interface SheduleDoctorListProps {
    schedules: ScheduleDetails[];
    onEditHistoryRecords: (IDUser: string) => void;
}

const SheduleDoctorList: React.FC<SheduleDoctorListProps> = ({ schedules, onEditHistoryRecords }) => {
    const today = new Date();

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        return new Date(date).toLocaleString('es-ES', options);
    };

    // Filtrar citas a partir de hoy y ordenarlas por fecha de inicio
    const futureSchedules = schedules
        .filter(schedule => new Date(schedule.StartAppointment) >= today)
        .sort((a, b) => new Date(a.StartAppointment).getTime() - new Date(b.StartAppointment).getTime());

    // Eliminar pacientes duplicados (manteniendo solo la primera cita futura de cada uno)
    const uniqueSchedules = futureSchedules.reduce((acc: ScheduleDetails[], schedule) => {
        if (!acc.some(s => s.IDPatient === schedule.IDPatient)) {
            acc.push(schedule);
        }
        return acc;
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Doctor Schedules</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueSchedules.map(schedule => (
                    <div key={schedule.ID} className="bg-white rounded-lg shadow-lg p-6 hover:scale-105 hover:shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Doctor: {schedule.User?.Name || 'No Name Available'}</h3>
                        <h4 className="text-md text-gray-600 mb-2">Start Date: {formatDate(schedule.StartAppointment)}</h4>
                        <h4 className="text-md text-gray-600 mb-4">End Date: {formatDate(schedule.EndAppointment)}</h4>

                        <button
                            onClick={() => onEditHistoryRecords(schedule.IDPatient)}
                            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            Enter the medical history of {schedule.Patient?.Name || 'No Patient Name'}
                            <i className="bx bx-edit-alt-2 ml-2"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SheduleDoctorList;
