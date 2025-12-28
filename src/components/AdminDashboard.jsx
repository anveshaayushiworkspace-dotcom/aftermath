import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { signOut } from "firebase/auth"
import { db, auth } from "../firebase"

export default function AdminDashboard() {
  const [issues, setIssues] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "issues"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      setIssues(data)
    })

    return () => unsub()
  }, [])

  const markResolved = async (id) => {
    await updateDoc(doc(db, "issues", id), {
      status: "resolved",
      resolvedAt: serverTimestamp(),
    })
  }

  const escalate = async (id, count = 0) => {
    await updateDoc(doc(db, "issues", id), {
      escalationCount: count + 1,
      status: "escalated",
    })
  }

  return (
    <>
      {/* TOP BAR */}
      <div style={styles.navbar}>
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        <button onClick={() => signOut(auth)} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* CONTENT */}
      <div style={styles.container}>
        {issues.length === 0 ? (
          <p>No issues reported.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Status</th>
                <th>Escalations</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.title}</td>
                  <td>{issue.location || "—"}</td>
                  <td>
                    <span
                      style={{
                        ...styles.status,
                        background:
                          issue.status === "resolved"
                            ? "#dcfce7"
                            : issue.status === "escalated"
                            ? "#fee2e2"
                            : "#e0f2fe",
                        color:
                          issue.status === "resolved"
                            ? "#166534"
                            : issue.status === "escalated"
                            ? "#991b1b"
                            : "#075985",
                      }}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td>{issue.escalationCount || 0}</td>
                  <td>
                    <div style={styles.actions}>
                      {issue.status !== "resolved" && (
                        <button
                          style={styles.resolveBtn}
                          onClick={() => markResolved(issue.id)}
                        >
                          Resolve
                        </button>
                      )}

                      <button
                        style={styles.escalateBtn}
                        onClick={() =>
                          escalate(issue.id, issue.escalationCount || 0)
                        }
                      >
                        Escalate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* STYLES */
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 28px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  logoutBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  container: {
    maxWidth: "1100px",
    margin: "30px auto",
    padding: "0 20px",
    fontFamily: "system-ui, sans-serif",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  status: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  resolveBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  escalateBtn: {
    background: "#f97316",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
}
