import pandas as pd
import io

def prepare_chatbot_context(file_path):
    """
    Generates a detailed text summary of a CSV file for LLM context.
    """
    try:
        # Load data (handling encoding as in model_pipeline)
        try:
            df = pd.read_csv(file_path, encoding='utf-8')
        except:
            try:
                df = pd.read_csv(file_path, encoding='latin1')
            except:
                df = pd.read_csv(file_path, encoding='cp1252')

        # 1. Basic Metadata
        summary = f"### Dataset Overview\n"
        summary += f"- **Rows:** {df.shape[0]}\n"
        summary += f"- **Columns:** {df.shape[1]}\n\n"

        # 2. Column Information
        summary += "### Column Metadata\n"
        col_info = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            null_count = df[col].isnull().sum()
            unique_count = df[col].nunique()
            col_info.append(f"| {col} | {dtype} | {null_count} nulls | {unique_count} unique |")
        
        summary += "| Column Name | Dtype | Nulls | Uniques |\n"
        summary += "|-------------|-------|-------|---------|\n"
        summary += "\n".join(col_info) + "\n\n"

        # 3. Statistical Summary
        summary += "### Statistical Summary (Numeric)\n"
        numeric_desc = df.describe().to_markdown()
        summary += f"{numeric_desc}\n\n"

        # 4. Sample Data
        summary += "### Sample Rows (Head)\n"
        summary += f"{df.head(3).to_markdown(index=False)}\n\n"

        # 5. Categorical Insights (Top values for categorical columns)
        cat_cols = df.select_dtypes(include=['object', 'category']).columns
        if len(cat_cols) > 0:
            summary += "### Categorical Distributions (Top 5 values)\n"
            for col in cat_cols:
                top_values = df[col].value_counts().head(5).to_dict()
                val_str = ", ".join([f"{k}: {v}" for k, v in top_values.items()])
                summary += f"- **{col}:** {val_str}\n"
            summary += "\n"

        return summary

    except Exception as e:
        return f"Error generating data context: {str(e)}"
