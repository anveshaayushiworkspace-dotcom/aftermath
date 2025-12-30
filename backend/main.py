from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
import pandas as pd
import os
import requests

app = FastAPI()

# --------------------
# CORS
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://aftermathh.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# GEMINI CONFIG (FIXED)
# --------------------
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1/models/"
    "gemini-1.5-flash:generateContent"
)

# --------------------
# MODELS
# --------------------
class Issue(BaseModel):
    title: str
    status: str
    createdAt: str
    adminNote: str | None = ""


class IssuePayload(BaseModel):
    issues: list[Issue]

# --------------------
# HELPERS
# --------------------
def days_unresolved(created_at: str) -> int:
    created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    return max((now - created).days, 0)

# --------------------
# ROUTES
# --------------------
@app.get("/")
def health_check():
    return {"status": "Aftermath backend running"}

@app.post("/debug")
def debug(payload: dict):
    return {"received": payload, "status": "OK"}

@app.post("/after-math")
def aftermath(payload: IssuePayload):
    try:
        df = pd.DataFrame([i.dict() for i in payload.issues])
        responses = []

        for _, row in df.iterrows():
            days = days_unresolved(row["createdAt"])

            prompt = f"""
Issue title: {row['title']}
Status: {row['status']}
Days unresolved: {days}
Admin note: {row.get('adminNote', '')}

Write ONE short, clear, public-facing sentence stating:
- issue name
- whether it is unresolved or resolved
- how long
- what the admin last said
""".strip()

            gemini_payload = {
                "contents": [
                    {
                        "parts": [{"text": prompt}]
                    }
                ]
            }

            r = requests.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json=gemini_payload,
                timeout=30,
            )

            r.raise_for_status()

            text = (
                r.json()
                .get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )

            responses.append(text)

        return {"aftermath": responses}

    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
