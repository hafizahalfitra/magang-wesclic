export interface PredictionRequest {
  umur: number;
  Divisi_Encoded: number;
  Jabatan_Encoded: number;
}

export interface PredictionResponse {
  predicted_salary: number;
  currency: string;
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
  estimated_total_budget: number;
  formatted_total_budget: string;
  insight: string;
}