import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import IssueCard from "./IssueCard"
import EscalationModal from "./EscalationModal"

export default function IssueList({ filter }) {
  const [issues, setIssues] = useState([])
  const [escalateIssue, setEscalateIssue] = useState(null)

  useEffect(() => {
    let q = collection(db, "issues")

    if (filter?.createdBy) {
      q = query(q, where("createdBy", "==", filter.createdBy))
    }

    return onSnapshot(q, snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const escalate = async issue => {
    await updateDoc(doc(db, "issues", issue.id), {
      escalationCount: (issue.escalationCount || 0) + 1,
      lastEscalatedAt: serverTimestamp(),
    })
    setEscalateIssue(null)
  }

  const verifyResolution = async (issue, accepted) => {
    if (accepted) {
      await updateDoc(doc(db, "issues", issue.id), {
        status: "closed",
        studentVerified: true,
        closedAt: serverTimestamp(),
      })
    } else {
      await updateDoc(doc(db, "issues", issue.id), {
        status: "ongoing",
        studentVerified: false,
        reopenedAt: serverTimestamp(),
      })
    }
  }

  return (
    <div>
      {issues.map(issue => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onEscalate={() => setEscalateIssue(issue)}
          onVerify={verifyResolution}
        />
      ))}

      {escalateIssue && (
        <EscalationModal
          issue={escalateIssue}
          onConfirm={() => escalate(escalateIssue)}
          close={() => setEscalateIssue(null)}
        />
      )}
    </div>
  )
}
