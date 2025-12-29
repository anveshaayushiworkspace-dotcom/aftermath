import os
import requests
import json

API_KEY = os.environ["GEMINI_API_KEY"]

url = "https://generativelanguage.googleapis.com/v1beta/models"

response = requests.get(f"{url}?key={API_KEY}")

print("STATUS:", response.status_code)
print(json.dumps(response.json(), indent=2))
