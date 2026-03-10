export interface PredictionRequest {
    umur: number;
    pendidikan: string;
    pengalamanKerja: number;
    jabatan: string;
}

export interface PredictionResponse {
    predicted_salary: number;
}