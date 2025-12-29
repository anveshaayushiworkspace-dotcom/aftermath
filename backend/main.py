from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timezone
import pandas as pd
import os
import requests
import json
from fastapi.middleware.cors import CORSMiddleware

# --------------------
# APP SETUP
# --------------------
app = FastAPI()

# ✅ CORS (LOCAL + VERCEL FRONTEND)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://aftermathh.vercel.app/",   
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# GEMINI CONFIG
# --------------------
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1/models/"
    "gemini-2.5-flash:generateContent"
)

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

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
    """
    Handles Firestore ISO timestamps safely (UTC aware)
    """
    created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    return max((now - created).days, 0)

# --------------------
# ROUTES
# --------------------
@app.get("/")
def health_check():
    """
    Simple health check so Render / browser doesn't show 404
    """
    return {"status": "Aftermath backend running"}

@app.post("/after-math")
def aftermath(payload: IssuePayload):
    df = pd.DataFrame([i.dict() for i in payload.issues])

    responses: list[str] = []

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
"""

        gemini_payload = {
            "contents": [
                {
                    "parts": [{"text": prompt.strip()}]
                }
            ]
        }

        response = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=gemini_payload,
            timeout=30,
        )

        response.raise_for_status()

        text = (
            response.json()
            .get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        responses.append(text)

    return {"aftermath": responses}
