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

  /* ---------------- FETCH ISSUES ---------------- */
  const fetchIssues = async () => {
    const snap = await getDocs(collection(db, "issues"))
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    setIssues(data)
    generateAftermath(data)
  }

  /* ---------------- STATUS MAPPING ---------------- */
  const getPublicStatus = (issue) => {
    if (issue.status === "resolved") {
      return {
        label: "Resolved (by Admin – pending verification)",
        bg: "#dcfce7",
        color: "#166534",
      }
    }

    if (issue.status === "ongoing") {
      return {
        label: "Ongoing (Admin)",
        bg: "#e0f2fe",
        color: "#075985",
      }
    }

    return {
      label: "Pending (Admin)",
      bg: "#fef3c7",
      color: "#92400e",
    }
  }

  /* ---------------- AI AFTERMATH ---------------- */
  const generateAftermath = async (issuesData) => {
    if (!issuesData || issuesData.length === 0) return
    if (!API_URL) {
      setErrorAI(true)
      return
    }

    setLoadingAI(true)
    setErrorAI(false)

    try {
      const payload = {
        issues: issuesData.map((i) => ({
          title: i.title,
          status: i.status,
          createdAt: i.createdAt?.toDate
            ? i.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          adminNote: i.adminNote || "",
        })),
      }

      const res = await fetch(`${API_URL}/after-math`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("AI request failed")

      const data = await res.json()
      setAftermath(data.aftermath || [])
    } catch {
      setErrorAI(true)
    } finally {
      setLoadingAI(false)
    }
  }

  /* ---------------- STATS ---------------- */
  const openIssues = issues.filter(
    (i) => i.status === "pending" || i.status === "ongoing"
  ).length

  const escalated = issues.filter(
    (i) => (i.escalationCount || 0) > 0
  ).length

  return (
    <div style={styles.container}>
      <button onClick={onGoToLogin} style={styles.loginBtn}>
        Go to Login
      </button>

      <h1 style={styles.title}>Public Accountability Dashboard</h1>

      <div style={styles.statsRow}>
        <StatCard label="Active Issues" value={openIssues} />
        <StatCard label="Escalated Issues" value={escalated} />
      </div>

      <h2 style={styles.sectionTitle}>Aftermath (AI Updates)</h2>

      {loadingAI && <p>Generating updates…</p>}
      {!loadingAI && errorAI && (
        <div style={styles.afterCard}>Summary unavailable</div>
      )}
      {!loadingAI &&
        !errorAI &&
        aftermath.map((line, idx) => (
          <div key={idx} style={styles.afterCard}>
            {line}
          </div>
        ))}

      <h2 style={styles.sectionTitle}>Reported Issues</h2>

      <div style={styles.issueList}>
        {issues.map((issue) => {
          const s = getPublicStatus(issue)
          return (
            <div key={issue.id} style={styles.issueCard}>
              <h3>{issue.title}</h3>
              <p>📍 {issue.location || "Not specified"}</p>

              <div style={styles.metaRow}>
                <span
                  style={{
                    ...styles.status,
                    backgroundColor: s.bg,
                    color: s.color,
                  }}
                >
                  {s.label}
                </span>

                <span>Escalations: {issue.escalationCount || 0}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- STAT CARD ---------------- */
function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
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
  title: { fontSize: "28px", marginBottom: "24px" },
  sectionTitle: { marginTop: "32px", marginBottom: "16px" },
  statsRow: { display: "flex", gap: "20px" },
  statCard: {
    background: "#f5f7fa",
    borderRadius: "10px",
    padding: "20px",
    minWidth: "180px",
    textAlign: "center",
  },
  statValue: { fontSize: "32px", fontWeight: "bold" },
  statLabel: { marginTop: "6px", color: "#555" },
  afterCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  issueList: { display: "flex", flexDirection: "column", gap: "16px" },
  issueCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
  },
  loginBtn: {
    marginBottom: "20px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
}
