export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const api = async (endpoint: string, options: RequestInit = {}) => {
    let token = null;
    if (typeof window !== "undefined") {
        token = localStorage.getItem("access_token");
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token && !headers["Authorization"]) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            if (typeof window !== "undefined" && window.location.pathname !== '/login') {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                window.location.href = '/login';
            }
        }
        let errorMessage = "Terjadi kesalahan pada server";
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch (e) {
            // Ignore if no JSON body
        }
        throw new Error(errorMessage);
    }

    return response.json();
};
