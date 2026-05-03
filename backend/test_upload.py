import requests
import pandas as pd
import numpy as np

# Create a dummy dataset
dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
df = pd.DataFrame({
    'Date': dates,
    'Sales': np.random.randint(100, 1000, size=100),
    'Profit': np.random.randint(10, 100, size=100),
    'Category': np.random.choice(['Electronics', 'Clothing', 'Home'], size=100),
    'Region': np.random.choice(['North', 'South', 'East', 'West'], size=100),
    'Product': np.random.choice(['Item A', 'Item B', 'Item C'], size=100),
    'Quantity': np.random.randint(1, 10, size=100)
})
df.to_csv('dummy_data.csv', index=False)

# Test the API
url = 'http://127.0.0.1:8000/forecast'
files = {'file': open('dummy_data.csv', 'rb')}
data = {'steps': 30}

try:
    response = requests.post(url, files=files, data=data)
    if response.status_code == 200:
        res = response.json()
        print("Keys returned:", res.keys())
        if 'dashboard_metrics' in res:
            print("Dashboard Metrics Keys:", res['dashboard_metrics'].keys())
            if 'revenue_by_day_of_week' in res['dashboard_metrics']:
                print("Day of week metric is present!")
            else:
                print("Day of week metric is MISSING")
        else:
            print("dashboard_metrics is MISSING")
    else:
        print("Error:", response.status_code, response.text)
except Exception as e:
    print("Failed to connect:", e)
