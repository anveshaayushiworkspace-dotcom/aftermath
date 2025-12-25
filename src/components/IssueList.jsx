import IssueCard from "./IssueCard"

export default function IssueList() {
  const issues = [
    { id: 1, title: "WiFi not working", status: "Stalled", days: 52 },
    { id: 2, title: "Library access", status: "Ongoing", days: 12 }
  ]

  return (
    <div>
      {issues.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  )
}
