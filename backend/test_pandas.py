
from aftermath_logic import analyze_issues

sample_issues = [
    {
        "id": "1",
        "title": "WiFi down",
        "status": "open",
        "createdAt": "2025-01-01"
    },
    {
        "id": "2",
        "title": "Water leakage",
        "status": "resolved",
        "createdAt": "2024-12-20"
    }
]

result = analyze_issues(sample_issues)
print(result)
