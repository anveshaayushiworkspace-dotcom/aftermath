export default function EscalationModal({ close }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Escalation Email</h3>
        <p>This issue has crossed the accountability threshold.</p>
        <button onClick={close}>Close</button>
      </div>
    </div>
  )
}
