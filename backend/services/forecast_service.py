import numpy as np
from fastapi import HTTPException
from models.request_models import ForecastRequest
from models.response_models import ForecastResponse, ForecastBreakdown
from ml.preprocessing import load_mapping
from services.prediction_service import get_model, format_rupiah

GROWTH_RATES = {
    "Engineering": 0.025,
    "Product & Design": 0.02,
    "Data & AI": 0.03,
    "Growth & Marketing": 0.018,
    "People & Operations": 0.015
}

def forecast_budget(payload: ForecastRequest) -> ForecastResponse:
    model = get_model()
    jabatan_map, divisi_map, _ = load_mapping()

    if payload.division not in divisi_map:
        raise HTTPException(status_code=400, detail=f"Divisi tidak valid: {payload.division}")

    divisi_enc = divisi_map[payload.division]
    growth_rate = GROWTH_RATES.get(payload.division, 0.0)

    job_configs = [
        {"name": "Junior", "count": payload.junior_count, "enc": jabatan_map.get("Junior", 7)},
        {"name": "STAF", "count": payload.staff_count, "enc": jabatan_map.get("STAF", 6)},
        {"name": "SPV", "count": payload.spv_count, "enc": jabatan_map.get("SPV", 5)},
        {"name": "Manajer", "count": payload.manager_count, "enc": jabatan_map.get("Manajer", 4)},
    ]

    breakdown = []
    base_budget = 0
    total_headcount = 0

    for job in job_configs:
        if job["count"] > 0:
            X = np.array([[job["enc"], divisi_enc]], dtype=float)
            pred_salary = int(round(float(model.predict(X)[0])))
            
            total_salary = pred_salary * job["count"]
            base_budget += total_salary
            total_headcount += job["count"]
            
            breakdown.append(ForecastBreakdown(
                position=job["name"],
                count=job["count"],
                salary_per_person=pred_salary,
                total_salary=total_salary,
                formatted_total_salary=format_rupiah(total_salary)
            ))

    forecast_period = payload.target_month - payload.current_month
    
    # Calculate cumulative budget (Total Anggaran selama periode)
    # n_months is the total months to be paid (from Month 2 to Month target)
    cumulative_budget = 0
    monthly_forecast = base_budget
    
    for i in range(1, forecast_period + 1):
        # Salary for month i (linear growth)
        monthly_salary = base_budget * (1 + growth_rate * i)
        cumulative_budget += monthly_salary
        if i == forecast_period:
            monthly_forecast = int(round(monthly_salary))

    estimated_total_budget = int(round(cumulative_budget))

    insight = f"Estimasi total anggaran untuk divisi {payload.division} selama periode {forecast_period} bulan ke depan "
    insight += f"adalah {format_rupiah(estimated_total_budget)}. "
    insight += f"Pertumbuhan gaji diperkirakan sebesar {growth_rate*100}% per bulan. "
    if growth_rate > 0.02:
        insight += "Divisi ini memiliki tingkat pertumbuhan gaji yang cukup tinggi."
    else:
        insight += "Tingkat pertumbuhan gaji di divisi ini relatif stabil."

    return ForecastResponse(
        division=payload.division,
        current_month=payload.current_month,
        target_month=payload.target_month,
        forecast_period=forecast_period,
        headcount=total_headcount,
        breakdown=breakdown,
        base_budget=base_budget,
        growth_rate=growth_rate,
        monthly_forecast=monthly_forecast,
        formatted_monthly_forecast=format_rupiah(monthly_forecast),
        estimated_total_budget=estimated_total_budget,
        formatted_total_budget=format_rupiah(estimated_total_budget),
        insight=insight
    )
