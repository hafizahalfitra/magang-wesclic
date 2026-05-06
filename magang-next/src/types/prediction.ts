export interface PredictionRequest {
  umur: number;
  Divisi_Encoded: number;
  Jabatan_Encoded: number;
}

export interface PredictionResponse {
  predicted_salary: number;
  currency: string;
}