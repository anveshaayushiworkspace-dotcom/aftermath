from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
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
# GEMINI CONFIG (STABLE)
# --------------------
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-pro:generateContent"
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
def health():
    return {"status": "Aftermath backend running"}

@app.post("/after-math")
def aftermath(payload: IssuePayload):
    results = []

    for issue in payload.issues:
        prompt = f"""
Issue title: {issue.title}
Status: {issue.status}
Days unresolved: {days_unresolved(issue.createdAt)}
Admin note: {issue.adminNote}

Write ONE clear, public-facing sentence summarizing this issue.
""".strip()

        r = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {"parts": [{"text": prompt}]}
                ]
            },
            timeout=30,
        )

        if r.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Gemini API error: {r.text}"
            )

        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        results.append(text)

    return {"aftermath": results}
