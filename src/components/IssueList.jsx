import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"

export default function IssueList({ filter }) {
  const [issues, setIssues] = useState([])

  useEffect(() => {
    let q = collection(db, "issues")

    if (filter?.createdBy) {
      q = query(q, where("createdBy", "==", filter.createdBy))
    }

    return onSnapshot(q, snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  return (
    <div>
      <h3>Issues</h3>

      {issues.map(issue => (
        <div key={issue.id} className="card">
          <b>{issue.title}</b>
          <p>{issue.description}</p>
          <span>Status: {issue.status}</span>
        </div>
      ))}
    </div>
  )
}
