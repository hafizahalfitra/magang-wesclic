import { LoginResponse, User } from "../types/auth";
import { api } from "./api";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data: LoginResponse = await api("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  },

  async getMe(): Promise<User> {
    return await api("/me", {
      method: "GET",
    });
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
  },

  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  },

  setUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
