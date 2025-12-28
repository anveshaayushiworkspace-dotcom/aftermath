import { signOut } from "firebase/auth"
import { auth } from "../firebase"

export default function Navbar({ title }) {
  return (
    <div style={styles.bar}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <button onClick={() => signOut(auth)} style={styles.btn}>
        Logout
      </button>
    </div>
  )
}

const styles = {
  bar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 28px",
    background: "#fff",
    borderBottom: "1px solid #ddd",
  },
  btn: {
    padding: "8px 16px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
}
