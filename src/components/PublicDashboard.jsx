import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"

export default function PublicDashboard({ onGoToLogin }) {
  const [issues, setIssues] = useState([])

  useEffect(() => {
    const fetchIssues = async () => {
      const snap = await getDocs(collection(db, "issues"))
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setIssues(data)
    }

    fetchIssues()
  }, [])

  const openIssues = issues.filter((i) => i.status === "open").length
  const escalated = issues.filter((i) => (i.escalationCount || 0) > 0).length

  return (
    <div style={styles.container}>
      {/* ✅ WORKING LOGIN BUTTON */}
      <button onClick={onGoToLogin} style={styles.loginBtn}>
        Go to Login
      </button>

      <h1 style={styles.title}>Public Dashboard</h1>

      {/* STATS */}
      <div style={styles.statsRow}>
        <StatCard label="Open Issues" value={openIssues} />
        <StatCard label="Escalated" value={escalated} />
      </div>

      <h2 style={styles.sectionTitle}>Reported Issues</h2>

      {/* ISSUE LIST */}
      <div style={styles.issueList}>
        {issues.map((issue) => (
          <div key={issue.id} style={styles.issueCard}>
            <h3 style={styles.issueTitle}>{issue.title}</h3>

            <p style={styles.location}>
              📍 {issue.location || "Not specified"}
            </p>

            <div style={styles.metaRow}>
              <span
                style={{
                  ...styles.status,
                  backgroundColor:
                    issue.status === "open" ? "#fee2e2" : "#dcfce7",
                  color:
                    issue.status === "open" ? "#991b1b" : "#166534",
                }}
              >
                {issue.status}
              </span>

              <span style={styles.escalation}>
                Escalations: {issue.escalationCount || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* STAT CARD */
function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

/* STYLES */
const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    fontSize: "28px",
    marginBottom: "24px",
  },
  sectionTitle: {
    marginTop: "32px",
    marginBottom: "16px",
  },
  statsRow: {
    display: "flex",
    gap: "20px",
  },
  statCard: {
    background: "#f5f7fa",
    borderRadius: "10px",
    padding: "20px",
    minWidth: "180px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "bold",
  },
  statLabel: {
    marginTop: "6px",
    color: "#555",
  },
  issueList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  issueCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
  },
  issueTitle: {
    margin: "0 0 8px",
  },
  location: {
    margin: "0 0 12px",
    color: "#555",
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
    fontWeight: "600",
    textTransform: "capitalize",
  },
  escalation: {
    fontSize: "13px",
    color: "#444",
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
