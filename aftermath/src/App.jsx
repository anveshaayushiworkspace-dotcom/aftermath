import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

import { auth, db } from "./firebase"
import Login from "./components/Login"
import StudentDashboard from "./components/StudentDashboard"
import AdminDashboard from "./components/AdminDashboard"
import PublicDashboard from "./components/PublicDashboard"

export default function App() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🔑 controls Public vs Login when logged out
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null)
        setRole(null)
        setShowLogin(false) // ✅ CRITICAL FIX
        setLoading(false)
        return
      }

      setUser(u)

      const snap = await getDoc(doc(db, "users", u.uid))
      setRole(snap.exists() ? snap.data().role : null)

      setLoading(false)
    })
  }, [])

  if (loading) return null

  // 🔐 LOGGED OUT FLOW
  if (!user) {
    return showLogin ? (
      <Login />
    ) : (
      <PublicDashboard onGoToLogin={() => setShowLogin(true)} />
    )
  }

  // 🔐 LOGGED IN FLOW
  if (role === "admin") return <AdminDashboard />
  if (role === "student") return <StudentDashboard />

  return <PublicDashboard onGoToLogin={() => setShowLogin(true)} />
}
