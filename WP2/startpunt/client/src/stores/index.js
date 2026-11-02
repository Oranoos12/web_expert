import { defineStore } from 'pinia';
import axios from 'axios';
import { reactive, ref } from 'vue';

const securityUrl = 'http://localhost:3000/security';
const taskUrl = 'http://localhost:3000/task';
const userUrl = 'http://localhost:3000/user';

export const useStore = defineStore('store', {
    state: () => ({
        user: {},
        tasks: [],
        allTasks: [],
        users: [],
        loading: false
    }),

    actions: {
        async login(credentials) {
            this.loading = true;
            this.user = {};
            this.tasks = [];
            this.allTasks = [];
            this.users = [];
            try {
                const { username, password } = credentials;
                const axiosConfig = { withCredentials: true };
                const response = await axios.post(`${securityUrl}/login`, { username, password }, axiosConfig);
                this.user = response.data;
            } catch (error) {
                throw new Error(error.message || 'Login failed');
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            this.loading = true;
            this.user = {};
            this.tasks = [];
            this.allTasks = [];
            this.users = [];
            try {
                const axiosConfig = { withCredentials: true };
                await axios.post(`${securityUrl}/logout`, {}, axiosConfig);
            } catch (error) {
                throw new Error(error.message || 'Logout failed');
            } finally {
                this.loading = false;
            }
        },

        async checkLogin() {
            this.loading = true;
            this.user = {};
            try {
                const axiosConfig = { withCredentials: true };
                const response = await axios.post(`${securityUrl}/login/check`, {}, axiosConfig);
                this.user = response.data;
            } catch (error) {
                throw new Error(error.message || 'Login check failed');
            } finally {
                this.loading = false;
            }
        },

        async changeCompleted(taskId, completed) {
            this.loading = true;
            try {
                const userId = this.user._id;
                const axiosConfig = { withCredentials: true };
                const response = await axios.patch(`${taskUrl}/${taskId}`, { completed }, axiosConfig);
                const index = this.tasks.findIndex(task => task._id === taskId);
                this.tasks[index].completed = completed;
            } catch (error) {
                throw new Error(error.message || 'Failed to update task completion status');
            } finally {
                this.loading = false;
            }
        },

        async retrieveOwnTasks() {
            this.loading = true;
            this.tasks = [];
            try {
                const id = this.user._id;
                const axiosConfig = {withCredentials: true};
                const response = await axios.get(`${taskUrl}/`, axiosConfig);
                this.tasks = response.data;
            } catch (error) {
                throw new Error(error.message || 'Failed to retrieve tasks');
            } finally {
                this.loading = false;
            }
        },

        // (a) admin: alle taken ophalen
        async retrieveAllTasks() {
            this.loading = true;
            try {
                const axiosConfig = {withCredentials: true};
                const response = await axios.get(`${taskUrl}/all`, axiosConfig);
                this.allTasks = response.data;
            } catch (error) {
                throw new Error(error.message || 'Failed to retrieve all tasks');
            } finally {
                this.loading = false;
            }
        },

        // (b) admin: alle gebruikers ophalen
        async retrieveAllUsers() {
            this.loading = true;
            try {
                const axiosConfig = {withCredentials: true};
                const response = await axios.get(userUrl, axiosConfig);
                this.users = response.data;
            } catch (error) {
                throw new Error(error.message || 'Failed to retrieve users');
            } finally {
                this.loading = false;
            }
        },

        // (c) admin: taak toekennen aan een gebruiker
        async assignTask(taskId, userId) {
            this.loading = true;
            try {
                const axiosConfig = {withCredentials: true};
                const response = await axios.patch(`${taskUrl}/${taskId}/user`, {userId}, axiosConfig);
                // de aangepaste taak in de lijst vervangen
                for (let i = 0; i < this.allTasks.length; i++) {
                    if (this.allTasks[i]._id === taskId) {
                        this.allTasks[i] = response.data;
                    }
                }
            } catch (error) {
                throw new Error(error.message || 'Failed to assign task');
            } finally {
                this.loading = false;
            }
        }
    }
});
