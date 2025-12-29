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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1/models/"
    "gemini-2.5-flash:generateContent"
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
    return (now - created).days


# --------------------
# ROUTES
# --------------------
@app.post("/after-math")
def aftermath(payload: IssuePayload):
    df = pd.DataFrame([i.dict() for i in payload.issues])

    responses = []

    for _, row in df.iterrows():
        days = days_unresolved(row["createdAt"])

        prompt = f"""
Issue title: {row['title']}
Status: {row['status']}
Days unresolved: {days}
Admin note: {row.get('adminNote', '')}

Write ONE clear public-facing sentence stating:
- issue name
- whether it is unresolved or resolved
- how long
- what the admin last said
"""

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
            data=json.dumps(gemini_payload),
        )

        r.raise_for_status()

        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        responses.append(text)

    return {"aftermath": responses}
