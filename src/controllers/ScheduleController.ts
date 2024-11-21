import { Schedule } from '../models/Schedule';
import {
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    fetchScheduleById,
} from '../services/Schedule';

export class ScheduleController {
    async getSchedules(): Promise<Schedule[]> {
        try {
            return await fetchSchedules();
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
            throw new Error('Could not fetch schedules.');
        }
    }

    async getSchedule(id: string): Promise<Schedule> {
        try {
            return await fetchScheduleById(id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error(`Failed to fetch schedule with ID ${id}:`, error);
            throw new Error(error);
        }
    }

    async addSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
        try {
            return await createSchedule(schedule);
        } catch (error) {
            console.error('Failed to create schedule:', error);
            throw new Error('Could not create schedule.');
        }
    }

    async editSchedule(schedule: Schedule): Promise<Schedule> {
        try {
            return await updateSchedule(schedule);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error('Failed to update schedule:', error);
            throw new Error(error.message);
        }
    }

    async removeSchedule(id: string): Promise<void> {
        try {
            await deleteSchedule(id);
        } catch (error) {
            console.error(`Failed to delete schedule with ID ${id}:`, error);
            throw new Error('Could not delete schedule.');
        }
    }

}
