import { useCallback, useEffect, useState } from 'react';
import { ScheduleDetails } from '../../models/Schedule';
import { ScheduleController } from '../../controllers/ScheduleController';
import { useNavigate } from 'react-router-dom';
import SheduleDoctorList from './SheduleDoctorList';
export const ScheduleDoctor = () => {
    const navigate = useNavigate(); 
    const [schedules, setSchedules] = useState<ScheduleDetails[]>([]);
    const [scheduleController] = useState(new ScheduleController());

    const handleEditMedicalHistory= (id:string)=>{
        navigate(`/patient/edit/${id}`)

    }

    const loadSchedule = useCallback(async () =>{
        try {
            const id = localStorage.getItem('id')
            if (!id) {
                console.error('User ID not found in local storage');
                return;
            }
            const fetchedSchedules = await scheduleController.getShedulesByUser(id);
            setSchedules(fetchedSchedules);
        }
        catch (error) {
            console.error('Failed to load schedules:', error);
        }   
    }, [scheduleController])

    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);
    

    return (
        <div>
            <div className="container-doctor">
                <SheduleDoctorList schedules={schedules} onEditHistoryRecords={handleEditMedicalHistory} />
            </div>
        </div>
    )
}