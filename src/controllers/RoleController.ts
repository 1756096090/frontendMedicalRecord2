import { Role } from '../models/Role';
import {
    fetchRoles,
} from '../services/Role';

export class RoleController {
    async getRoles(): Promise<Role[]> {
        try {
            return await fetchRoles();
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            throw new Error('Could not fetch roles.');
        }
    }


}
