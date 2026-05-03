import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
# Load environment variables from .env file
load_dotenv()

# Configure the API key securely
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("⚠️ Warning: GOOGLE_API_KEY environment variable is not set. Please add it to your .env file.")

genai.configure(api_key=api_key, transport='rest')

# System instruction to define the persona
system_instruction = """
You are 'Fora', a highly professional, highly knowledgeable Business Data Analyst for the 'Forecastify' platform. 
Forecastify is an advanced business analytics suite that helps users connect data, analyze trends, and forecast future performance using AI.

Your primary role is to assist users with:
1. Explaining complex data analysis concepts (e.g., What is MAE? How does ARIMA work?).
2. Providing insights and strategies based on business, finance, and sales data.
3. Helping users understand the visualization graphs and charts provided by our website (Line charts for trends, Bar charts for comparisons).
4. Answering any general business or analytics questions they might have.
5. Analyzing the provided 'Dataset Context' and 'Application Context' to give specific answers about the user's data.

Context Awareness & Intelligence:
- You are 'Fora', the AI heart of Forecastify.
- You are aware of what page the user is on (e.g., /analysis, /history, /dashboard).
- If the user is on the /analysis page, you have access to their current dataset summary, metrics, and forecast results.
- **Critical Intelligence**: Don't just repeat numbers. Interpret them. If sales are trending down, suggest marketing or inventory changes. If a forecast has high error (MAE/MSE), explain that the data might be volatile or seasonal.
- Use the 'Dataset Overview' to understand the scale of the business (e.g., units sold vs. revenue).

Response Style:
- **Be Extremely Concise**: Provide the most direct answer possible. Avoid long-winded calculations or "thinking out loud".
- **Limit Length**: Responses should ideally be 1-3 sentences unless a deep explanation is explicitly requested.
- **Direct Answers**: If the user asks for a specific value or trend, give it immediately.
- **Actionable & Brief**: Your insights should be high-impact but short. Use bullet points for readability.

Tone: Professional, analytical, and extremely concise.
Capabilities: Textual analysis, data summary interpretation, and direct business insight generation.

Guidelines:
- If a 'Dataset Context' is provided, use it to ground your answers in the user's actual data.
- Always prioritize clarity and actionable business insights.
- If you don't know an answer based on the context, be honest but try to provide helpful general guidance.
"""

# Initialize the model once for efficiency
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=system_instruction
)

def get_chat_response(user_input: str, file_path: str = None, app_context: str = None, chat_history: str = None, active_file_id: str = None) -> dict:
    """
    Sends a prompt (and optionally a file) to Gemini, considering chat history, and returns the response.
    """
    try:
        gemini_history = []
        if chat_history:
            frontend_messages = json.loads(chat_history)
            
            # TOKEN OPTIMIZATION: Sliding Window (Send only the last 10 messages)
            # Skip the first message (static greeting) and take only recent history
            history_to_send = frontend_messages[1:]
            MAX_HISTORY = 10
            if len(history_to_send) > MAX_HISTORY:
                history_to_send = history_to_send[-MAX_HISTORY:]

            for msg in history_to_send:
                role = 'user' if msg['role'] == 'user' else 'model'
                gemini_history.append({"role": role, "parts": [msg['content']]})

        contents = []
        if app_context:
            try:
                context_data = json.loads(app_context)
                formatted_context = "### CURRENT APPLICATION STATE\n"
                
                if 'currentPage' in context_data:
                    formatted_context += f"- **User Location:** {context_data['currentPage']}\n"
                
                if 'currentForecast' in context_data and context_data['currentForecast']:
                    fc = context_data['currentForecast']
                    formatted_context += f"#### Active Dataset: {fc.get('fileName', 'Unknown')}\n"
                    
                    if 'dataSummary' in fc and fc['dataSummary']:
                        formatted_context += f"\n#### DATASET SUMMARY:\n{fc['dataSummary']}\n"
                    
                    if 'metrics' in fc and fc['metrics']:
                        formatted_context += f"\n#### DASHBOARD METRICS:\n{json.dumps(fc['metrics'], indent=2)}\n"
                    
                    # Instead of sending ALL data points (which is slow), we summarize key values
                    if 'actualValues' in fc and fc['actualValues']:
                        vals = fc['actualValues']
                        formatted_context += f"\n#### DATA TRENDS:\n- Total Points: {len(vals)}\n"
                        formatted_context += f"- Latest Value: {vals[-1]}\n"
                        formatted_context += f"- Max Value: {max(vals)}\n"
                        formatted_context += f"- Min Value: {min(vals)}\n"

                contents.append(formatted_context)
            except Exception as context_err:
                print(f"Context Parse Error: {str(context_err)}")
                contents.append(f"[SYSTEM CONTEXT]: {app_context[:500]}...") # Truncate if failed
            
        contents.append(f"USER QUERY: {user_input}")

        new_file_id = None
        if file_path:
             # Upload the file to Gemini's File API and persist it
             uploaded_file = genai.upload_file(path=file_path)
             contents.append(uploaded_file)
             new_file_id = uploaded_file.name
        elif active_file_id:
             # Retrieve the previously uploaded file
             existing_file = genai.get_file(active_file_id)
             contents.append(existing_file)

        chat_session = model.start_chat(history=gemini_history)
        response = chat_session.send_message(contents)

        return {"response": response.text, "new_file_id": new_file_id}

    except Exception as e:
        print(f"Chatbot Error: {str(e)}")
        return {"error": str(e)}
