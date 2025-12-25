import { useState } from "react"
import EscalationModal from "./EscalationModal"

export default function IssueCard({ issue }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card">
      <h4>{issue.title}</h4>
      <span className={`status ${issue.status}`}>{issue.status}</span>
      <p>Days Pending: {issue.days}</p>
      {issue.days >= 50 && <button onClick={() => setOpen(true)}>View Escalation</button>}
      {open && <EscalationModal close={() => setOpen(false)} />}
    </div>
  )
}
