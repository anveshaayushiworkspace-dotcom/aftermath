import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"

export default function IssueForm({ userId }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")

  const submit = async () => {
    if (!title || !description) return

    await addDoc(collection(db, "issues"), {
      title,
      description,
      location: location || "Not specified",
      createdBy: userId,
      status: "pending",
      escalationCount: 0,
      adminResolved: false,
      studentVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    setTitle("")
    setDescription("")
    setLocation("")
  }

  return (
    <div className="card">
      <h3>Submit Issue</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        placeholder="Location (e.g. Girls Hostel, 2nd Floor)"
        value={location}
        onChange={e => setLocation(e.target.value)}
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
