import requests
import json

base_url = "http://localhost:8000"

# 1. Login
login_payload = {"email": "hrd@wesclic.com", "password": "password123"}
lr = requests.post(f"{base_url}/login", json=login_payload)
token = lr.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Test Forecast
url = f"{base_url}/forecast-budget"
payload = {
    "division": "Engineering",
    "current_month": 1,
    "target_month": 2,
    "status": "Tetap",
    "junior_count": 3,
    "staff_count": 5,
    "spv_count": 1,
    "manager_count": 1
}

print("Testing 1 month (target=2, current=1):")
r1 = requests.post(url, json=payload, headers=headers)
data1 = r1.json()
print(f"Total: {data1['formatted_total_budget']}")
print(f"Monthly: {data1['formatted_monthly_forecast']}")

print("\nTesting 5 months (target=6, current=1):")
payload["target_month"] = 6
r5 = requests.post(url, json=payload, headers=headers)
data5 = r5.json()
print(f"Total: {data5['formatted_total_budget']}")
print(f"Monthly: {data5['formatted_monthly_forecast']}")
print(f"Ratio: {data5['estimated_total_budget'] / data1['estimated_total_budget']:.2f}x")
