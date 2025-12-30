export default function EscalationModal({ issue, onConfirm, close }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Escalate Issue</h3>
        <p>
          You are escalating: <b>{issue.title}</b>
        </p>
        <p>This will notify higher authorities.</p>

        <button onClick={onConfirm}>Confirm Escalation</button>
        <button onClick={close}>Cancel</button>
      </div>
    </div>
  )
}

