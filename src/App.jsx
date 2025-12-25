import { useState } from "react"
import Login from "./components/Login"
import StudentDashboard from "./components/StudentDashboard"
import AdminDashboard from "./components/AdminDashboard"

export default function App() {
  const [role, setRole] = useState(null)

  if (!role) return <Login setRole={setRole} />

  if (role === "student") return <StudentDashboard />

  return <AdminDashboard />
}
