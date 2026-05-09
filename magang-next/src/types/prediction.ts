export interface PredictionRequest {
  umur: number;
  Divisi_Encoded: number;
  Jabatan_Encoded: number;
}

export interface PredictionResponse {
  predicted_salary: number;
  currency: string;
}

// Tipe untuk endpoint /predict-salary berbasis dataset_clean.csv
export interface SalaryRequest {
  divisi: string;
  jabatan: string;
  pengalaman?: number;
  umur?: number;
}

export interface SalaryResponse {
  divisi: string;
  jabatan: string;
  pengalaman: number;
  umur: number;
  base_salary: number;
  adjustment: number;
  predicted_salary: number;
  base_salary_format: string;
  predicted_salary_format: string;
  currency: string;
  message?: string;
}

export interface ForecastBreakdown {
  position: string;
  count: number;
  salary_per_person: number;
  total_salary: number;
  formatted_total_salary: string;
}

export interface ForecastRequest {
  division: string;
  current_month: number;
  target_month: number;
  status: string;
  junior_count: number;
  staff_count: number;
  spv_count: number;
  manager_count: number;
}

export interface ForecastResponse {
  division: string;
  current_month: number;
  target_month: number;
  forecast_period: number;
  headcount: number;
  breakdown: ForecastBreakdown[];
  base_budget: number;
  growth_rate: number;
  monthly_forecast: number;
  formatted_monthly_forecast: string;
  estimated_total_budget: number;
  formatted_total_budget: string;
  insight: string;
}\n\nexport interface PositionCountsResponse {\n  junior: number;\n  staff: number;\n  spv: number;\n  manager: number;\n}