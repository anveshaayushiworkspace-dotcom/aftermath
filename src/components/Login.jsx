export default function Login({ setRole }) {
  return (
    <div className="container card">
      <h2>AFTERMATH Login</h2>
      <button onClick={() => setRole("student")}>Student</button>
      <button className="secondary" onClick={() => setRole("admin")}>Admin</button>
    </div>
  )
}
