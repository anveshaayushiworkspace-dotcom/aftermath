import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"

const API_URL = import.meta.env.VITE_API_URL

export default function PublicDashboard({ onGoToLogin }) {
  const [issues, setIssues] = useState([])
  const [aftermath, setAftermath] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [errorAI, setErrorAI] = useState(false)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const snap = await getDocs(collection(db, "issues"))
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setIssues(data)
    generateAftermath(data)
  }

  const getPublicStatus = issue => {
    if (issue.status === "closed") {
      return {
        label: "Resolved (Verified by Student)",
        bg: "#dcfce7",
        color: "#166534",
      }
    }

    if (issue.status === "resolved") {
      return {
        label: "Resolved by Admin (Pending Student Verification)",
        bg: "#e0f2fe",
        color: "#075985",
      }
    }

    if (issue.status === "ongoing") {
      return {
        label: "Ongoing (Admin)",
        bg: "#fef3c7",
        color: "#92400e",
      }
    }

    return {
      label: "Pending (Admin)",
      bg: "#fee2e2",
      color: "#991b1b",
    }
  }

  const totalIssues = issues.length
  const fullyResolved = issues.filter(i => i.status === "closed").length
  const pendingIssues = totalIssues - fullyResolved

  const generateAftermath = async issuesData => {
    if (!API_URL || issuesData.length === 0) return

    setLoadingAI(true)
    try {
      const res = await fetch(`${API_URL}/after-math`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issues: issuesData }),
      })
      const data = await res.json()
      setAftermath(data.aftermath || [])
    } catch {
      setErrorAI(true)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <div style={styles.container}>
      <button onClick={onGoToLogin} style={styles.loginBtn}>
        Go to Login
      </button>

      <h1>Public Accountability Dashboard</h1>

      <div style={styles.stats}>
        <Stat label="Total Issues" value={totalIssues} />
        <Stat label="Fully Resolved" value={fullyResolved} />
        <Stat label="Pending / In Progress" value={pendingIssues} />
      </div>

      <h2>Reported Issues</h2>

      {issues.map(issue => {
        const s = getPublicStatus(issue)
        return (
          <div key={issue.id} style={styles.card}>
            <h3>{issue.title}</h3>
            <p>📍 {issue.location || "Not specified"}</p>
            <span
              style={{
                background: s.bg,
                color: s.color,
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "12px",
              }}
            >
              {s.label}
            </span>
            <p style={{ float: "right" }}>
              Escalations: {issue.escalationCount || 0}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#666" }}>{label}</div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "0 20px",
  },
  loginBtn: {
    marginBottom: 20,
  },
  stats: {
    display: "flex",
    gap: 20,
    marginBottom: 30,
  },
  statCard: {
    background: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    minWidth: 160,
    textAlign: "center",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
}
