import { PredictionRequest, PredictionResponse } from "@/src/types/prediction";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function predictSalary(
    payload: PredictionRequest
): Promise<PredictionResponse> {
    const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Gagal melakukan prediksi gaji");
    }

    return response.json();
}