import { useState } from "react"

export default function IssueForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  return (
    <div className="card">
      <h3>Submit Issue</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <button>Submit</button>
    </div>
  )
}
