import pymysql
import os
import hashlib
import json

# Database Configuration
db_config = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", ""),
    "database": os.getenv("MYSQL_DB", "forecastify_db"),
    "cursorclass": pymysql.cursors.DictCursor
}

def get_connection():
    try:
        return pymysql.connect(**db_config)
    except Exception as e:
        print(f"❌ Error connecting to MySQL: {e}")
        return None

def init_db():
    """Initializes the database schema if it doesn't exist."""
    conn = None
    try:
        # Connect without DB first to create it
        temp_config = db_config.copy()
        db_name = temp_config.pop("database")
        temp_config.pop("cursorclass")
        
        temp_conn = pymysql.connect(**temp_config)
        with temp_conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        temp_conn.close()

        conn = pymysql.connect(**db_config)
        with conn.cursor() as cursor:
            # Users Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'user') DEFAULT 'user',
                    onboarding_completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # History Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS history (
                    id VARCHAR(255) PRIMARY KEY,
                    user_email VARCHAR(255),
                    file_name VARCHAR(255),
                    forecast_days INT,
                    best_model VARCHAR(255),
                    metrics LONGTEXT,
                    forecast_data LONGTEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
                )
            """)
            
            # Ensure compatibility for existing tables
            try:
                cursor.execute("ALTER TABLE history MODIFY COLUMN metrics LONGTEXT")
            except Exception:
                pass
            
            try:
                cursor.execute("ALTER TABLE history ADD COLUMN forecast_data LONGTEXT")
            except Exception:
                pass

            # Insert Admin if not exists
            admin_email = "admin@gmail.com"
            admin_password = hashlib.sha256("admin1234".encode()).hexdigest()
            cursor.execute("SELECT * FROM users WHERE email = %s", (admin_email,))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO users (name, email, password, role, onboarding_completed) VALUES (%s, %s, %s, %s, TRUE)",
                    ("Primary Admin", admin_email, admin_password, "admin")
                )
            else:
                cursor.execute("UPDATE users SET onboarding_completed = TRUE WHERE email = %s", (admin_email,))

        
        conn.commit()
        print("✅ MySQL Schema Initialized (via PyMySQL)")
    except Exception as e:
        print(f"❌ MySQL Init Error: {e}")
    finally:
        if conn:
            conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_user(email, password):
    conn = get_connection()
    if not conn: return None
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if user and user['password'] == hash_password(password):
                return user
        return None
    finally:
        conn.close()

def register_user(name, email, password):
    conn = get_connection()
    if not conn: return False, "DB connection failed"
    try:
        with conn.cursor() as cursor:
            # Enforce admin@gmail.com rule
            role = 'admin' if email.lower() == 'admin@gmail.com' else 'user'
            hpwd = hash_password(password)
            cursor.execute(
                "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                (name, email, hpwd, role)
            )
        conn.commit()
        return True, None
    except pymysql.err.IntegrityError:
        return False, "Email already registered"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def save_history_entry(user_email, entry):
    conn = get_connection()
    if not conn: return False
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO history (id, user_email, file_name, forecast_days, best_model, metrics, forecast_data) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (entry['id'], user_email, entry['fileName'], entry['forecastDays'], entry['bestModel'], 
                 json.dumps(entry['metrics']), json.dumps(entry['forecastData']))
            )
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ Save History Error in DB: {e}")
        return False
    finally:
        conn.close()

def complete_user_onboarding(email):
    conn = get_connection()
    if not conn: return False
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE users SET onboarding_completed = TRUE WHERE email = %s", (email,))
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ Complete Onboarding Error: {e}")
        return False
    finally:
        conn.close()

def get_user_history(email):
    conn = get_connection()
    if not conn: return []
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM history WHERE user_email = %s ORDER BY timestamp DESC LIMIT 50", (email,))
            return cursor.fetchall()
    finally:
        conn.close()

def clear_user_history(email):
    conn = get_connection()
    if not conn: return False
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM history WHERE user_email = %s", (email,))
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ Clear History Error: {e}")
        return False
    finally:
        conn.close()

def delete_history_entry(entry_id, email):
    conn = get_connection()
    if not conn: return False
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM history WHERE id = %s AND user_email = %s", (entry_id, email))
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ Delete Entry Error: {e}")
        return False
    finally:
        conn.close()
