import { 
    PredictionRequest, 
    PredictionResponse, 
    ForecastRequest, 
    ForecastResponse,
    SalaryResponse
} from "@/src/types/prediction";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function predictSalaryByDataset(
    divisi: string,
    jabatan: string,
    pengalaman: number = 0,
    umur: number = 0
): Promise<SalaryResponse> {
    try {
        const params = new URLSearchParams({ 
            divisi, 
            jabatan,
            pengalaman: pengalaman.toString(),
            umur: umur.toString()
        });
        const response = await fetch(`${API_BASE_URL}/predict-salary?${params.toString()}`);

        if (!response.ok) {
            throw new Error("Gagal melakukan prediksi gaji. Pastikan backend FastAPI berjalan di " + API_BASE_URL);
        }

        return await response.json();
    } catch (error) {
        console.error("Prediction Error:", error);
        throw error instanceof Error ? error : new Error("Terjadi kesalahan saat menghubungi server");
    }
}

export async function predictSalary(
    payload: PredictionRequest
): Promise<PredictionResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("Gagal melakukan prediksi gaji. Pastikan backend FastAPI berjalan di " + API_BASE_URL);
        }

        return await response.json();
    } catch (error) {
        console.error("Prediction Error:", error);
        throw error instanceof Error ? error : new Error("Terjadi kesalahan saat menghubungi server");
    }
}

export async function forecastBudget(
    payload: ForecastRequest,
    token?: string
): Promise<ForecastResponse> {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/forecast-budget`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Sesi berakhir atau Anda tidak memiliki akses sebagai HRD.");
            }
            const errorData = await response.json().catch(() => ({ detail: "Gagal menghitung forecast budget" }));
            throw new Error(errorData.detail || "Gagal menghitung forecast budget.");
        }

        return await response.json();
    } catch (error) {
        console.error("Forecast Error:", error);
        throw error instanceof Error ? error : new Error("Terjadi kesalahan saat menghubungi server");
    }
}