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

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "issues", id), {
      status,
      updatedAt: serverTimestamp(),
      ...(status === "resolved" && {
        adminResolvedAt: serverTimestamp(),
        adminResolved: true,
      }),
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
                <th>Last Update</th>
                <th>Action</th>
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
                            : issue.status === "ongoing"
                            ? "#e0f2fe"
                            : "#fef3c7",
                        color:
                          issue.status === "resolved"
                            ? "#166534"
                            : issue.status === "ongoing"
                            ? "#075985"
                            : "#92400e",
                      }}
                    >
                      {issue.status}
                    </span>
                  </td>

                  <td>
                    {issue.updatedAt
                      ? new Date(
                          issue.updatedAt.seconds * 1000
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    <select
                      value={issue.status}
                      onChange={(e) =>
                        updateStatus(issue.id, e.target.value)
                      }
                      style={styles.select}
                    >
                      <option value="pending">Pending</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="resolved">Resolved</option>
                    </select>
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
  select: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
  },
}
