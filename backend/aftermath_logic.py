import pandas as pd
from datetime import datetime

ESCALATION_DAYS = 30

def analyze_issues(issues):
    df = pd.DataFrame(issues)

    df["createdAt"] = pd.to_datetime(df["createdAt"])
    today = datetime.utcnow()

    df["days_open"] = (today - df["createdAt"]).dt.days

    df["escalation_required"] = (
        (df["status"] != "resolved") &
        (df["days_open"] >= ESCALATION_DAYS)
    )

    summary = {
        "total_issues": len(df),
        "open_issues": len(df[df["status"] == "open"]),
        "escalated": len(df[df["escalation_required"]]),
    }

    return {
        "summary": summary,
        "issues": df.to_dict(orient="records")
    }
