import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)

load_dotenv(BASE_DIR / ".env")

# Server Config
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

# Firebase Config
_cred_env = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase_credentials.json")
FIREBASE_CREDENTIALS_PATH = str(Path(_cred_env) if Path(_cred_env).is_absolute() else BASE_DIR / _cred_env)
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "agenttrimproject")
LOCAL_DB_FILE = DATA_DIR / "firestore_local_db.json"

# AI Keys (Optional - Intelligent fallback extraction engine available out-of-the-box)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
