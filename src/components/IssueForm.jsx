import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"

export default function IssueForm({ userId }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const submit = async () => {
    if (!title || !description) return

    await addDoc(collection(db, "issues"), {
      title,
      description,
      createdBy: userId,
      status: "open",
      escalationCount: 0,
      createdAt: serverTimestamp(),
      resolvedAt: null,
    })

    setTitle("")
    setDescription("")
  }

  return (
    <div className="card">
      <h3>Submit Issue</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <button onClick={submit}>Submit</button>
    </div>
  )
}
