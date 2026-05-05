export interface PredictionRequest {
  Pendidikan_Encoded: number;
  Jabatan_Encoded: number;
}

export interface PredictionResponse {
  predicted_salary: number;
  currency: string;
}