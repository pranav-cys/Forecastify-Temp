import os

# ✅ LOAD .ENV FIRST (Before any other imports)
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            if line.strip() and not line.startswith("#"):
                try:
                    key, value = line.strip().split("=", 1)
                    os.environ[key] = value.strip().strip('"\'')
                except ValueError:
                    pass

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

from model_pipeline import run_pipeline
from chatbot_pipeline import prepare_chatbot_context
from db import init_db, verify_user, register_user, save_history_entry, get_user_history, get_connection, clear_user_history, delete_history_entry

# Initialize MySQL
init_db()

app = FastAPI()

# ✅ Allow frontend (Claude UI) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def home():
    return {"message": "🚀 Sales Forecast API Running"}


# =========================
# FORECAST ENDPOINT
# =========================
@app.post("/forecast")
async def forecast(
    file: UploadFile = File(...),
    steps: int = Form(30)   # ✅ slider input
):
    try:
        # ✅ Save uploaded file temporarily
        file_location = f"temp_{file.filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ✅ Run ML pipeline with slider steps
        result = run_pipeline(file_location, steps)

        # ✅ Generate detailed chatbot context
        data_summary = prepare_chatbot_context(file_location)

        # ✅ Clean up temp file
        os.remove(file_location)

        # ✅ Ensure JSON-safe response
        response = {
            "best_model": result["best_model"],
            "dates": [str(d) for d in result["dates"]],
            "forecast": [float(x) for x in result["forecast"]],
            "actual_dates": [str(d) for d in result["actual_dates"]],
            "actual_values": [float(x) for x in result["actual_values"]],
            "dashboard_metrics": result.get("dashboard_metrics", {}),
            "data_summary": data_summary
        }

        return response

    except Exception as e:
        return {"error": str(e)}

# =========================
# FORGOT PASSWORD EMAIL
# =========================
class EmailRequest(BaseModel):
    email: str
    reset_link: str

@app.post("/send-reset-email")
async def send_reset_email(req: EmailRequest):
    try:
        sender_email = os.getenv("SMTP_EMAIL", "")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        if not sender_email or not sender_password or sender_email == "your_email@gmail.com":
            print(f"⚠️ SMTP not configured. Simulated sending to {req.email}: {req.reset_link}")
            return {"success": True, "message": "Email simulated (SMTP not configured)"}

        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = req.email
        msg['Subject'] = "Forecastify: Password Reset Request"
        
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0f172a;">Password Reset Request</h2>
            <p>We received a request to reset your password for your Forecastify account.</p>
            <p>Click the secure link below to set a new password:</p>
            <div style="margin: 30px 0;">
              <a href="{req.reset_link}" style="display:inline-block; padding: 12px 24px; background-color: #0ea5e9; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP (Assuming Gmail)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Real email sent successfully to {req.email}")
        return {"success": True, "message": "Email sent"}
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return {"success": False, "error": str(e)}

# =========================
# WELCOME EMAIL
# =========================
class WelcomeEmailRequest(BaseModel):
    email: str
    name: str

@app.post("/send-welcome-email")
async def send_welcome_email(req: WelcomeEmailRequest):
    try:
        sender_email = os.getenv("SMTP_EMAIL", "")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        if not sender_email or not sender_password or sender_email == "your_email@gmail.com":
            print(f"⚠️ SMTP not configured. Simulated welcome email to {req.email}")
            return {"success": True, "message": "Email simulated"}

        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = req.email
        msg['Subject'] = "Welcome to Forecastify! 🚀"
        
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0f172a;">Welcome to Forecastify, {req.name}!</h2>
            <p>We are absolutely thrilled to have you on board.</p>
            <p>Forecastify is your ultimate business analytics suite. With our advanced AI-driven models, you can seamlessly connect your data, analyze hidden trends, and forecast future performance with unparalleled accuracy.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-left: 4px solid #0ea5e9; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #0ea5e9;">Getting Started:</h3>
                <ul style="padding-left: 20px; color: #475569;">
                    <li style="margin-bottom: 10px;"><b>1. Connect Data:</b> Upload your historical sales datasets.</li>
                    <li style="margin-bottom: 10px;"><b>2. Analyze & Forecast:</b> Let our machine learning algorithms run the numbers.</li>
                    <li><b>3. Discover Insights:</b> View interactive dashboards and make data-driven decisions.</li>
                </ul>
            </div>
            <p>If you have any questions or need help setting up your first forecast, our support team is just an email away.</p>
            <p style="margin-top: 40px; font-weight: bold; color: #0f172a;">Happy Forecasting!<br>The Forecastify Team</p>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Real welcome email sent successfully to {req.email}")
        return {"success": True, "message": "Welcome email sent"}
    except Exception as e:
        print(f"❌ Error sending welcome email: {str(e)}")
        return {"success": False, "error": str(e)}

# =========================
# SHARE REPORT EMAIL
# =========================
@app.post("/share-report")
async def share_report(email: str = Form(...), file: UploadFile = File(...)):
    try:
        sender_email = os.getenv("SMTP_EMAIL", "")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        if not sender_email or not sender_password or sender_email == "your_email@gmail.com":
            print(f"⚠️ SMTP not configured. Simulated sharing report to {email}")
            return {"success": True, "message": "Email simulated (SMTP not configured)"}

        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = "Forecastify: Your Analysis Report"
        
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0f172a;">Analysis Report Shared with You</h2>
            <p>A Forecastify Analysis Report has been shared with you.</p>
            <p>Please find the attached PDF report containing advanced predictive analysis and insights.</p>
            <p style="margin-top: 40px; font-weight: bold; color: #0f172a;">Happy Forecasting!<br>The Forecastify Team</p>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Attach the file
        file_content = await file.read()
        part = MIMEApplication(file_content, Name="Forecast_Analysis.pdf")
        part['Content-Disposition'] = 'attachment; filename="Forecast_Analysis.pdf"'
        msg.attach(part)
        
        # Connect to SMTP (Assuming Gmail)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Real report email sent successfully to {email}")
        return {"success": True, "message": "Report email sent"}
    except Exception as e:
        print(f"❌ Error sending report email: {str(e)}")
        return {"success": False, "error": str(e)}

# =========================
# CONTACT TEAM EMAIL
# =========================
class ContactTeamRequest(BaseModel):
    name: str
    email: str
    message: str

@app.post("/contact-team")
async def contact_team(req: ContactTeamRequest):
    try:
        sender_email = os.getenv("SMTP_EMAIL", "")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        if not sender_email or not sender_password or sender_email == "your_email@gmail.com":
            print(f"⚠️ SMTP not configured. Simulated receiving contact from {req.name} ({req.email}): {req.message}")
            return {"success": True, "message": "Email simulated (SMTP not configured)"}

        # Create message sent TO the team (sender_email)
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = sender_email
        msg['Reply-To'] = req.email
        msg['Subject'] = f"Forecastify Support Request from {req.name}"
        
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0f172a;">New Contact Team Submission</h2>
            <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-left: 4px solid #0ea5e9; border-radius: 4px;">
                <p><b>Name:</b> {req.name}</p>
                <p><b>Email:</b> {req.email}</p>
                <p style="margin-top: 15px;"><b>Message:</b></p>
                <p style="white-space: pre-wrap;">{req.message}</p>
            </div>
            <p style="font-size: 12px; color: #64748b;">Reply directly to this email to respond to {req.name}.</p>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP (Assuming Gmail)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Real contact team email received from {req.email}")
        return {"success": True, "message": "Message sent to team"}
    except Exception as e:
        print(f"❌ Error sending contact team email: {str(e)}")
        return {"success": False, "error": str(e)}

# =========================
# AUTHENTICATION ENDPOINTS
# =========================
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(req: LoginRequest):
    user = verify_user(req.email, req.password)
    if user:
        # Return user data without password
        return {
            "success": True, 
            "user": {
                "name": user['name'],
                "email": user['email'],
                "role": user['role'],
                "onboardingCompleted": bool(user['onboarding_completed'])
            }
        }
    return {"success": False, "error": "Invalid email or password"}

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

@app.post("/register")
async def register(req: RegisterRequest, background_tasks: BackgroundTasks):
    success, error = register_user(req.name, req.email, req.password)
    if success:
        # Send welcome email in the background
        background_tasks.add_task(send_welcome_email, WelcomeEmailRequest(name=req.name, email=req.email))
        
        # Auto-login after registration
        user = verify_user(req.email, req.password)
        return {
            "success": True, 
            "user": {
                "name": user['name'],
                "email": user['email'],
                "role": user['role'],
                "onboardingCompleted": False
            }
        }
    return {"success": False, "error": error}

@app.post("/onboarding/complete")
async def complete_onboarding(email: str = Form(...)):
    from db import complete_user_onboarding
    success = complete_user_onboarding(email)
    return {"success": success}

# =========================
# HISTORY ENDPOINTS
# =========================
@app.get("/history/{email}")
async def get_history(email: str):
    history = get_user_history(email)
    # Convert JSON metrics back to dict
    import json
    for entry in history:
        if isinstance(entry['metrics'], str):
            entry['metrics'] = json.loads(entry['metrics'])
        if isinstance(entry.get('forecast_data'), str):
            entry['forecastData'] = json.loads(entry.pop('forecast_data'))
        elif 'forecast_data' in entry:
            entry['forecastData'] = entry.pop('forecast_data')
            
        entry['fileName'] = entry.pop('file_name')
        entry['forecastDays'] = entry.pop('forecast_days')
        entry['bestModel'] = entry.pop('best_model')
        entry['timestamp'] = str(entry['timestamp'])
    return history

@app.post("/history/save")
async def save_history(entry: str = Form(...), email: str = Form(...)):
    import json
    try:
        entry_dict = json.loads(entry)
        success = save_history_entry(email, entry_dict)
        return {"success": success}
    except Exception as e:
        print(f"❌ Error in save_history endpoint: {e}")
        return {"success": False, "error": str(e)}

@app.delete("/history/clear/{email}")
async def clear_history(email: str):
    success = clear_user_history(email)
    return {"success": success}

@app.delete("/history/entry/{email}/{entry_id}")
async def remove_history_entry(email: str, entry_id: str):
    success = delete_history_entry(entry_id, email)
    return {"success": success}

# =========================
# ADMIN ENDPOINTS
# =========================
@app.get("/admin/users")
async def get_all_users(admin_email: str):
    # Verify admin status
    conn = get_connection()
    if not conn: return {"error": "DB error"}
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM users WHERE email = %s", (admin_email,))
        admin = cursor.fetchone()
        if not admin or admin['role'] != 'admin':
            return {"error": "Unauthorized"}
        
        cursor.execute("SELECT name, email, role, created_at FROM users")
        return cursor.fetchall()
    finally:
        conn.close()

# =========================
# FORA CHATBOT ENDPOINT
# =========================
from chatbot import get_chat_response

@app.post("/chat")
async def chat_endpoint(
    message: str = Form(...), 
    file: UploadFile = File(None),
    app_context: str = Form(None),
    chat_history: str = Form(None),
    active_file_id: str = Form(None)
):
    try:
        file_path = None
        if file:
            # Save uploaded file temporarily
            file_path = f"temp_chat_{file.filename}"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

        # Get response from Gemini
        response_data = get_chat_response(message, file_path, app_context, chat_history, active_file_id)

        # Clean up temp file locally
        if file_path and os.path.exists(file_path):
            os.remove(file_path)

        return response_data

    except Exception as e:
        if file_path and os.path.exists(file_path):
             os.remove(file_path)
        return {"error": str(e)}

@app.post("/admin/users/role")
async def update_role(email: str = Form(...), role: str = Form(...), admin_email: str = Form(...)):
    conn = get_connection()
    if not conn: return {"error": "DB error"}
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM users WHERE email = %s", (admin_email,))
        admin = cursor.fetchone()
        if not admin or admin['role'] != 'admin':
            return {"error": "Unauthorized"}
            
        cursor.execute("UPDATE users SET role = %s WHERE email = %s", (role, email))
        conn.commit()
        return {"success": True}
    finally:
        conn.close()

@app.delete("/admin/users/{email}")
async def delete_user(email: str, admin_email: str):
    if email.lower() == 'admin@gmail.com':
        return {"success": False, "error": "Cannot delete primary admin"}
    
    conn = get_connection()
    if not conn: return {"error": "DB error"}
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM users WHERE email = %s", (admin_email,))
        admin = cursor.fetchone()
        if not admin or admin['role'] != 'admin':
            return {"error": "Unauthorized"}

        cursor.execute("DELETE FROM users WHERE email = %s", (email,))
        conn.commit()
        return {"success": True}
    finally:
        conn.close()