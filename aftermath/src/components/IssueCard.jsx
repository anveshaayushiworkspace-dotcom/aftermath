import { Card, Group, Text, Badge, Button } from "@mantine/core"
import {
  WifiOff,
  Droplets,
  LightbulbOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

function getIssueIcon(title) {
  const t = title.toLowerCase()
  if (t.includes("wifi")) return <WifiOff size={18} />
  if (t.includes("water")) return <Droplets size={18} />
  if (t.includes("light")) return <LightbulbOff size={18} />
  return <AlertTriangle size={18} />
}

function getStatusBadge(status) {
  if (status === "closed")
    return <Badge color="green">Closed (Verified)</Badge>

  if (status === "resolved")
    return <Badge color="green">Resolved (Pending Verification)</Badge>

  if (status === "ongoing")
    return <Badge color="blue">Ongoing</Badge>

  return <Badge color="yellow">Pending</Badge>
}

export default function IssueCard({ issue, onEscalate, onVerify }) {
  return (
    <Card shadow="sm" radius="md" mb="md">
      <Group justify="space-between">
        <Group>
          {getIssueIcon(issue.title)}
          <Text fw={600}>{issue.title}</Text>
        </Group>
        {getStatusBadge(issue.status)}
      </Group>

      <Text size="sm" mt={6} c="dimmed">
        {issue.description}
      </Text>

      <Group mt="sm" gap="sm">
        {(issue.status === "pending" || issue.status === "ongoing") && (
          <Button
            variant="light"
            color="red"
            onClick={onEscalate}
          >
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
    </Card>
  )
}

