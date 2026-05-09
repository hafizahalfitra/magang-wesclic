import { ForecastRequest, ForecastResponse, PositionCountsResponse } from "@/src/types/prediction";
import { api } from "./api";

export async function forecastBudget(
    payload: ForecastRequest
): Promise<ForecastResponse> {
    try {
        return await api("/forecast-budget", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error("Forecast Error:", error);
        throw error instanceof Error ? error : new Error("Terjadi kesalahan saat menghubungi server");
    }
}

export async function getPositionCounts(
    divisionName: string
): Promise<PositionCountsResponse> {
    try {
        return await api(`/divisi/${encodeURIComponent(divisionName)}/counts`, {
            method: "GET",
        });
    } catch (error) {
        console.error("Fetch Counts Error:", error);
        throw error instanceof Error ? error : new Error("Terjadi kesalahan saat mengambil data jabatan");
    }
}
