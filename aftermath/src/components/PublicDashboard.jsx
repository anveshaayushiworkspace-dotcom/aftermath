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

  /* ---------------- FETCH ISSUES ---------------- */
  const fetchIssues = async () => {
    const snap = await getDocs(collection(db, "issues"))
    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }))

    setIssues(data)
    generateAftermath(data)
  }

  /* ---------------- AI AFTERMATH ---------------- */
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

  /* ---------------- STATUS LABEL ---------------- */
  const getStatusLabel = issue => {
    if (issue.status === "closed") return "Resolved (Verified)"
    if (issue.status === "resolved") return "Resolved by Admin"
    if (issue.status === "ongoing") return "Ongoing"
    return "Pending"
  }

  /* ---------------- TOP STATS ---------------- */
  const totalIssues = issues.length

  const fullyResolved = issues.filter(
    i => i.status === "closed"
  ).length

  const inProgress = issues.filter(
    i =>
      i.status === "pending" ||
      i.status === "ongoing" ||
      i.status === "resolved"
  ).length

  const resolutionRate = totalIssues
    ? Math.round((fullyResolved / totalIssues) * 100)
    : 0

  return (
    <div style={styles.container}>
      <button onClick={onGoToLogin} style={styles.loginBtn}>
        Go to Login
      </button>

      <h1 style={styles.title}>Public Accountability Dashboard</h1>

      {/* -------- TOP STATS -------- */}
      <div style={styles.topStats}>
        <Stat label="Total Issues" value={totalIssues} />
        <Stat label="Fully Resolved" value={fullyResolved} color="#166534" />
        <Stat label="In Progress" value={inProgress} color="#92400e" />
        <Stat label="Resolution Rate" value={`${resolutionRate}%`} />
      </div>

      {aiUnavailable && (
        <div style={styles.aiWarning}>
          AI service temporarily unavailable. Showing system-generated updates.
        </div>
      )}

      {/* -------- ISSUES LIST -------- */}
      {issues.map((issue, index) => (
        <div key={issue.id} style={styles.issueCard}>
          <h3 style={styles.issueTitle}>{issue.title}</h3>

          <p style={styles.location}>
            📍 {issue.location || "Not specified"}
          </p>

          <span style={styles.statusBadge}>
            {getStatusLabel(issue)}
          </span>

          {/* -------- AI SUMMARY INLINE -------- */}
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

/* ---------------- STAT CARD ---------------- */
function Stat({ label, value, color }) {
  return (
    <div style={styles.statItem}>
      <div style={{ ...styles.statNumber, color: color || "#111827" }}>
        {value}
      </div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

/* ---------------- STYLES ---------------- */
const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    fontSize: "28px",
    marginBottom: "16px",
  },
  loginBtn: {
    marginBottom: "20px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
  topStats: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginBottom: "28px",
  },
  statItem: {
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px 20px",
    minWidth: "160px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    textAlign: "right",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
  },
  statLabel: {
    marginTop: "6px",
    fontSize: "13px",
    color: "#6b7280",
  },
  issueCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
  },
  issueTitle: {
    margin: "0 0 6px",
  },
  location: {
    margin: "0 0 8px",
    color: "#555",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    background: "#f1f5f9",
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
    fontSize: "14px",
  },
}
