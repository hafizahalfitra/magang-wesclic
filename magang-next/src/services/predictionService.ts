import { 
    PredictionRequest, 
    PredictionResponse, 
    SalaryResponse
} from "@/src/types/prediction";
import { api } from "./api";

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
        return await api(`/predict-salary?${params.toString()}`);
    } catch (error) {
        console.error("Prediction Error:", error);
        throw error instanceof Error ? error : new Error("Terjadi kesalahan saat menghubungi server");
    }
}

export async function predictSalary(
    payload: PredictionRequest
): Promise<PredictionResponse> {
    try {
        return await api("/predict", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error("Prediction Error:", error);
        throw error instanceof Error ? error : new Error("Terjadi kesalahan saat menghubungi server");
    }
}