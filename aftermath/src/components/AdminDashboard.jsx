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
    const unsub = onSnapshot(collection(db, "issues"), snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "issues", id), {
      status,
      adminResolved: status === "resolved",
      updatedAt: serverTimestamp(),
      resolvedAt: status === "resolved" ? serverTimestamp() : null,
    })
  }

  const getAdminStatusLabel = issue => {
    if (issue.status === "closed") return "Closed"
    if (issue.status === "resolved") return "Resolved (Awaiting Student)"
    if (issue.status === "ongoing") return "Ongoing"
    return "Pending"
  }

  return (
    <>
      <div style={styles.navbar}>
        <h2>Admin Dashboard</h2>
        <button onClick={() => signOut(auth)} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.container}>
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
            {issues.map(issue => (
              <tr key={issue.id}>
                <td>{issue.title}</td>
                <td>{issue.location || "—"}</td>
                <td>{getAdminStatusLabel(issue)}</td>
                <td>
                  {issue.updatedAt?.toDate
                    ? issue.updatedAt.toDate().toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  <select
                    value={issue.status}
                    disabled={issue.status === "closed"}
                    onChange={e =>
                      updateStatus(issue.id, e.target.value)
                    }
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
      </div>
    </>
  )
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 28px",
    borderBottom: "1px solid #e5e7eb",
  },
  logoutBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
  },
  container: {
    maxWidth: "1100px",
    margin: "30px auto",
    padding: "0 20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
}
