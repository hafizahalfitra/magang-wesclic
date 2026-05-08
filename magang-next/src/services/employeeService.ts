import { api } from "./api";

export const employeeService = {
    async getEmployees() {
        return await api("/employees?limit=100");
    },
    
    async addEmployee(payload: any) {
        return await api("/employees", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    async updateEmployee(id: number, payload: any) {
        return await api(`/employees/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    },

    async deleteEmployee(id: number) {
        return await api(`/employees/${id}`, {
            method: "DELETE"
        });
    }
};
