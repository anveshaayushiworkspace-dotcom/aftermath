import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"

const API_URL = import.meta.env.VITE_API_URL

export default function PublicDashboard({ onGoToLogin }) {
  const [issues, setIssues] = useState([])
  const [aftermath, setAftermath] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiUnavailable, setAiUnavailable] = useState(false)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const snap = await getDocs(collection(db, "issues"))
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setIssues(data)
    generateAftermath(data)
  }

  const generateAftermath = async (issuesData) => {
    if (!API_URL || issuesData.length === 0) return

    setLoadingAI(true)
    setAiUnavailable(false)

    try {
      const res = await fetch(`${API_URL}/after-math`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issues: issuesData.map(i => ({
            title: i.title,
            status: i.status,
            createdAt: i.createdAt?.toDate
              ? i.createdAt.toDate().toISOString()
              : null,
            adminNote: i.adminNote || "",
          })),
        }),
      })

      const data = await res.json()
      setAftermath(data.aftermath || [])
    } catch {
      setAiUnavailable(true)
    } finally {
      setLoadingAI(false)
    }
  }

  const getStatusBadge = issue => {
    if (issue.status === "closed") return "Resolved (Verified)"
    if (issue.status === "resolved") return "Resolved by Admin"
    if (issue.status === "ongoing") return "Ongoing"
    return "Pending"
  }

  return (
    <div style={styles.container}>
      <button onClick={onGoToLogin} style={styles.loginBtn}>
        Go to Login
      </button>

      <h1>Public Accountability Dashboard</h1>

      {aiUnavailable && (
        <div style={styles.aiWarning}>
          AI summaries unavailable. Showing system-generated updates.
        </div>
      )}

      {issues.map((issue, index) => (
        <div key={issue.id} style={styles.issueCard}>
          <h3>{issue.title}</h3>

          <p style={styles.location}>
            📍 {issue.location || "Not specified"}
          </p>

          <span style={styles.status}>
            {getStatusBadge(issue)}
          </span>

          {/* ✅ AI SUMMARY INLINE */}
          <div style={styles.aiBox}>
            {loadingAI && !aftermath[index] && (
              <span style={{ color: "#666" }}>
                Generating AI update…
              </span>
            )}

            {!loadingAI && aftermath[index] && (
              <span>{aftermath[index]}</span>
            )}

            {!loadingAI && !aftermath[index] && (
              <span style={{ color: "#666" }}>
                No AI update available.
              </span>
            )}
          </div>

          <div style={styles.meta}>
            Escalations: {issue.escalationCount || 0}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "system-ui, sans-serif",
  },
  loginBtn: {
    marginBottom: "20px",
  },
  issueCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
  },
  location: {
    color: "#555",
    marginBottom: "6px",
  },
  status: {
    display: "inline-block",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    marginBottom: "10px",
  },
  aiBox: {
    marginTop: "10px",
    padding: "10px 12px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  meta: {
    marginTop: "8px",
    fontSize: "13px",
    color: "#444",
  },
  aiWarning: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
}
