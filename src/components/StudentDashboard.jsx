import IssueForm from "./IssueForm"
import IssueList from "./IssueList"

export default function StudentDashboard() {
  return (
    <div className="container">
      <h2>Student Dashboard</h2>
      <IssueForm />
      <IssueList />
    </div>
  )
}
