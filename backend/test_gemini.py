import os
import requests
import json

API_KEY = os.environ["GEMINI_API_KEY"]

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

payload = {
    "contents": [
        {
            "parts": [
                {
                    "text": "Summarize why tracking unresolved campus issues matters."
                }
            ]
        }
    ]
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(
    f"{url}?key={API_KEY}",
    headers=headers,
    json=payload
)

print("STATUS:", response.status_code)
print(json.dumps(response.json(), indent=2))
