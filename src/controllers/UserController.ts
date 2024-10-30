import { User } from '../models/User';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchUserById,
    login,
} from '../services/User';

export class UserController {
    async getUsers(): Promise<User[]> {
        try {
            return await fetchUsers();
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw new Error('Could not fetch users.');
        }
    }

    async getUser(id: string): Promise<User> {
        try {
            return await fetchUserById(id);
        } catch (error) {
            console.error(`Failed to fetch user with ID ${id}:`, error);
            throw new Error('Could not fetch user.');
        }
    }

    async addUser(user: Omit<User, 'id'>): Promise<User> {
        try {
            return await createUser(user);
        } catch (error) {
            console.error('Failed to create user:', error);
            throw new Error('Could not create user.');
        }
    }

    async editUser(user: User): Promise<User> {
        try {
            return await updateUser(user);
        } catch (error) {
            console.error('Failed to update user:', error);
            throw new Error('Could not update user.');
        }
    }

    async removeUser(id: string): Promise<void> {
        try {
            await deleteUser(id);
        } catch (error) {
            console.error(`Failed to delete user with ID ${id}:`, error);
            throw new Error('Could not delete user.');
        }
    }

    async login(email: string, password: string): Promise<unknown> {
        try {
            return await login(email, password);
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Invalid email or password.');
        }
    }
}
