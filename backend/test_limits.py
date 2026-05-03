import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash", "gemini-pro"]

for m in models:
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content("hello")
        print(f"{m}: Success")
    except Exception as e:
        print(f"{m}: Failed - {e}")
