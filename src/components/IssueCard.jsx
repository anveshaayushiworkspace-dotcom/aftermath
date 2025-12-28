import { Card, Group, Text, Badge, Button } from "@mantine/core"
import { useState } from "react"
import {
  WifiOff,
  Droplets,
  LightbulbOff,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import EscalationModal from "./EscalationModal"

function getIssueIcon(title) {
  const t = title.toLowerCase()
  if (t.includes("wifi")) return <WifiOff size={18} />
  if (t.includes("water") || t.includes("washroom")) return <Droplets size={18} />
  if (t.includes("light")) return <LightbulbOff size={18} />
  return <AlertTriangle size={18} />
}

function getStatusBadge(status) {
  if (status === "Resolved") return <Badge color="green" leftSection={<CheckCircle size={12} />}>Resolved</Badge>
  if (status === "Stalled") return <Badge color="red">Stalled</Badge>
  return <Badge color="yellow">Ongoing</Badge>
}

export default function IssueCard({ issue, admin }) {
  const [open, setOpen] = useState(false)

  return (
    <Card shadow="sm" radius="md">
      <Group justify="space-between" align="center">
        <Group gap="sm">
          {getIssueIcon(issue.title)}
          <Text fw={600}>{issue.title}</Text>
        </Group>
        {getStatusBadge(issue.status)}
      </Group>

      <Group mt={6} gap="xs">
        <Clock size={14} />
        <Text size="sm" c="dimmed">
          {issue.days} days pending
        </Text>
      </Group>

      <Group mt="sm">
        {issue.days >= 50 && (
          <Button
            variant="light"
            color="red"
            leftSection={<AlertTriangle size={16} />}
            onClick={() => setOpen(true)}
          >
            View Escalation
          </Button>
        )}

        {admin && (
          <Button
            color="green"
            leftSection={<CheckCircle size={16} />}
          >
            Mark Resolved
          </Button>
        )}
      </Group>

      {open && <EscalationModal close={() => setOpen(false)} />}
    </Card>
  )
}
