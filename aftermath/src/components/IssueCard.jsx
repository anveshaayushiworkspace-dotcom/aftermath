import { Card, Group, Text, Badge, Button } from "@mantine/core"
import {
  WifiOff,
  Droplets,
  LightbulbOff,
  AlertTriangle,
  CheckCircle,
  MapPin,
} from "lucide-react"

function getIcon(title) {
  const t = title.toLowerCase()
  if (t.includes("wifi")) return <WifiOff size={18} />
  if (t.includes("water")) return <Droplets size={18} />
  if (t.includes("light")) return <LightbulbOff size={18} />
  return <AlertTriangle size={18} />
}

function getBadge(status) {
  if (status === "closed")
    return <Badge color="green">Resolved (Verified)</Badge>

  if (status === "resolved")
    return <Badge color="blue">Resolved (Pending Verification)</Badge>

  if (status === "ongoing")
    return <Badge color="yellow">Ongoing</Badge>

  return <Badge color="red">Pending</Badge>
}

export default function IssueCard({ issue, onEscalate, onVerify }) {
  return (
    <Card shadow="sm" radius="md" mb="md">
      <Group justify="space-between">
        <Group>
          {getIcon(issue.title)}
          <Text fw={600}>{issue.title}</Text>
        </Group>
        {getBadge(issue.status)}
      </Group>

      <Group mt={6} gap="xs">
        <MapPin size={14} />
        <Text size="sm" c="dimmed">
          {issue.location || "Not specified"}
        </Text>
      </Group>

      <Text size="sm" mt={6} c="dimmed">
        {issue.description}
      </Text>

      <Group mt="sm" gap="sm">
        {(issue.status === "pending" || issue.status === "ongoing") && (
          <Button variant="light" color="red" onClick={onEscalate}>
            Escalate
          </Button>
        )}

        {issue.status === "resolved" && (
          <>
            <Button
              color="green"
              leftSection={<CheckCircle size={16} />}
              onClick={() => onVerify(issue, true)}
            >
              Confirm Resolution
            </Button>
            <Button
              variant="outline"
              color="red"
              onClick={() => onVerify(issue, false)}
            >
              Still Not Fixed
            </Button>
          </>
        )}
      </Group>

      <Text size="xs" mt="sm" c="dimmed">
        Escalations: {issue.escalationCount || 0}
      </Text>
    </Card>
  )
}


