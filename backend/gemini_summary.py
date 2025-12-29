import os
import requests

API_KEY = os.environ["GEMINI_API_KEY"]

def summarize_issues(text: str) -> str:
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

    payload = {
        "contents": [
            {
                "parts": [{"text": text}]
            }
        ]
    }

    response = requests.post(
        f"{url}?key={API_KEY}",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    data = response.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]
