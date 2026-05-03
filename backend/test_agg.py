import pandas as pd
import numpy as np

def find_col(df, keywords, numeric_only=False):
    for col in df.columns:
        if numeric_only and not pd.api.types.is_numeric_dtype(df[col]):
            continue
        if any(k in col.lower() for k in keywords):
            return col
    return None

def extract_dashboard_data(df, target_col, date_col):
    res = {}
    
    # 1. Total KPI
    res['total_revenue'] = float(df[target_col].sum()) if target_col else 0
    res['total_orders'] = len(df) # fallback
    
    order_col = find_col(df, ['order', 'invoice', 'receipt'])
    if order_col:
        res['total_orders'] = int(df[order_col].nunique())
        
    qty_col = find_col(df, ['qty', 'quantity'], numeric_only=True)
    if qty_col:
        res['total_quantity'] = float(df[qty_col].sum())
        
    profit_col = find_col(df, ['profit', 'margin'], numeric_only=True)
    if profit_col:
        res['total_profit'] = float(df[profit_col].sum())
        
    customer_col = find_col(df, ['customer', 'client', 'user'])
    if customer_col:
        res['total_customers'] = int(df[customer_col].nunique())
        
    # 2. Category Agg
    cat_col = find_col(df, ['category', 'type', 'department', 'segment'])
    if cat_col:
        agg = df.groupby(cat_col)[target_col].sum().sort_values(ascending=False).head(10)
        res['revenue_by_category'] = [{'name': str(k), 'value': float(v)} for k, v in agg.items()]
        
        if profit_col:
            # profit vs revenue scatter data
            agg2 = df.groupby(cat_col).agg({target_col: 'sum', profit_col: 'sum'})
            res['profit_vs_revenue'] = [
                {'name': str(k), 'revenue': float(row[target_col]), 'profit': float(row[profit_col])}
                for k, row in agg2.iterrows()
            ]
            
        if qty_col:
            agg3 = df.groupby(cat_col)[qty_col].sum()
            res['quantity_by_category'] = [{'name': str(k), 'value': float(v)} for k, v in agg3.items()]
            
        # Monthly by Category
        if date_col:
            df_temp = df.copy()
            df_temp['Month'] = pd.to_datetime(df_temp[date_col]).dt.to_period('M').astype(str)
            pivot = df_temp.pivot_table(index='Month', columns=cat_col, values=target_col, aggfunc='sum', fill_value=0)
            res['monthly_revenue_by_category'] = {
                'months': list(pivot.index),
                'series': {str(col): [float(x) for x in pivot[col].values] for col in pivot.columns}
            }

    # 3. Region Agg
    reg_col = find_col(df, ['region', 'state', 'location', 'city'])
    if reg_col:
        agg = df.groupby(reg_col)[target_col].sum().sort_values(ascending=False).head(10)
        res['revenue_by_region'] = [{'name': str(k), 'value': float(v)} for k, v in agg.items()]
        
        if cat_col:
            # Heatmap data
            pivot = df.pivot_table(index=cat_col, columns=reg_col, values=target_col, aggfunc='sum', fill_value=0)
            res['revenue_heatmap'] = {
                'categories': list(pivot.index),
                'regions': list(pivot.columns),
                'data': [[i, j, float(pivot.iloc[i, j])] for i in range(len(pivot.index)) for j in range(len(pivot.columns))]
            }

    # 4. Product Agg
    prod_col = find_col(df, ['product', 'item', 'name'])
    if prod_col:
        agg = df.groupby(prod_col)[target_col].sum().sort_values(ascending=False).head(10)
        res['top_products'] = [{'name': str(k), 'value': float(v)} for k, v in agg.items()]

    return res

import json
df = pd.DataFrame({
    'date': pd.date_range('2023-01-01', periods=10),
    'order_id': [1,1,2,2,3,3,4,4,5,5],
    'quantity': [10,20,10,20,10,20,10,20,10,20],
    'profit': [5,10,5,10,5,10,5,10,5,10],
    'customer': ['A','A','B','B','C','C','D','D','E','E'],
    'category': ['X','Y','X','Y','X','Y','X','Y','X','Y'],
    'region': ['N','S','N','S','N','S','N','S','N','S'],
    'product': ['P1','P2','P1','P2','P1','P2','P1','P2','P1','P2'],
    'sales': [100,200,100,200,100,200,100,200,100,200]
})
print(json.dumps(extract_dashboard_data(df, 'sales', 'date'), indent=2))
