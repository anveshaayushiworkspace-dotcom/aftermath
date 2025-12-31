from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional, List
import pandas as pd
import os
import requests

app = FastAPI()


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


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1/models/"
    "gemini-1.5-flash:generateContent"
)


class Issue(BaseModel):
    title: str
    status: str
    createdAt: Optional[str] = None
    adminNote: Optional[str] = ""

class IssuePayload(BaseModel):
    issues: List[Issue]


def days_unresolved(created_at: Optional[str]) -> int:
    if not created_at:
        return 0
    try:
        created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return max((now - created).days, 0)
    except Exception:
        return 0

def fallback_summary(issue: Issue, days: int) -> str:
    if issue.status in ("closed", "resolved"):
        return f"{issue.title} has been resolved after {days} days."
    return f"{issue.title} remains unresolved for {days} days."


@app.get("/")
def health_check():
    return {"status": "Aftermath backend running"}

@app.post("/after-math")
def aftermath(payload: IssuePayload):
    df = pd.DataFrame([i.dict() for i in payload.issues])
    responses = []

    for _, row in df.iterrows():
        days = days_unresolved(row.get("createdAt"))

        # ---- FALLBACK FIRST (IMPORTANT) ----
        fallback = fallback_summary(
            Issue(**row.to_dict()), days
        )

        # If Gemini key missing → NEVER FAIL
        if not GEMINI_API_KEY:
            responses.append(fallback)
            continue

        prompt = f"""
Issue title: {row['title']}
Status: {row['status']}
Days unresolved: {days}
Admin note: {row.get('adminNote', '')}

Write ONE short, clear, public-facing sentence.
""".strip()

        try:
            r = requests.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [
                        {"parts": [{"text": prompt}]}
                    ]
                },
                timeout=15,  #  IMPORTANT
            )

            if r.status_code != 200:
                responses.append(fallback)
                continue

            data = r.json()
            text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text")
            )

            responses.append(text or fallback)

        except Exception:
            # ABSOLUTE SAFETY
            responses.append(fallback)

    return {"aftermath": responses}
