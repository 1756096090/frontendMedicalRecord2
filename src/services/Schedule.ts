import { Schedule, ScheduleDetails } from '../models/Schedule';
import config from '../config';
import { handleResponse } from './handleResponse';

const API_URL = `${config.API_BASE_URL}/schedule`;


export const fetchSchedules = async (): Promise<Schedule[]> => {
    const response = await fetch(API_URL);
    return handleResponse(response);
};

export const fetchScheduleById = async (id: string): Promise<Schedule> => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
};

export const createSchedule = async (schedule: Omit<Schedule, 'ID'>): Promise<Schedule> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
    });
    return handleResponse(response);
};

export const updateSchedule = async (schedule: Schedule): Promise<Schedule> => {
    const response = await fetch(`${API_URL}/${schedule.ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
    });
    return handleResponse(response);
};

export const deleteSchedule = async (id: string ): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

export const fetchShedulesByMonthYear = async (month: number, year: number): Promise<Schedule[]> =>{
    const response = await fetch(`${API_URL}/by-month-year`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({month, year})

    })
    return handleResponse(response)
}

export const fetchShedulesByUser = async (IDUser: string): Promise<ScheduleDetails[]> =>{
    const response = await fetch(`${API_URL}/by-user`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({IDUser})

    })
    return handleResponse(response)
}