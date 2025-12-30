import Navbar from "./Navbar"
import IssueForm from "./IssueForm"
import IssueList from "./IssueList"
import { auth } from "../firebase"

export default function StudentDashboard() {
  return (
    <>
      <Navbar title="Student Dashboard" />

      <div style={styles.container}>
        <Card title="Submit Issue">
          <IssueForm userId={auth.currentUser.uid} />
        </Card>

        <Card title="Your Issues">
          <IssueList
            filter={{ createdBy: auth.currentUser.uid }}
            renderStatus={getStudentStatus}
          />
        </Card>
      </div>
    </>
  )
}

/* ---------- STATUS MAPPING FOR STUDENT ---------- */
function getStudentStatus(issue) {
  if (issue.status === "resolved") {
    return {
      label: "Resolved by Admin (Pending Your Verification)",
      bg: "#dcfce7",
      color: "#166534",
    }
  }

  if (issue.status === "ongoing") {
    return {
      label: "Ongoing (Admin Working)",
      bg: "#e0f2fe",
      color: "#075985",
    }
  }

  return {
    label: "Pending (Awaiting Admin)",
    bg: "#fef3c7",
    color: "#92400e",
  }
}


function Card({ title, children }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "32px auto",
    display: "grid",
    gap: "24px",
  },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },
}
