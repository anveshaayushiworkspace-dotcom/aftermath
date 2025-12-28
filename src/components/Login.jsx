import { useState } from "react"
import {
  TextInput,
  Button,
  Stack,
  Paper,
  Title,
  Text,
  Divider,
} from "@mantine/core"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../firebase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setError("")
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const signup = async (role) => {
    setError("")
    try {
      setLoading(true)
      const cred = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <Paper shadow="md" radius="md" p="xl" w={360} mx="auto" mt={120}>
      <Stack>
        <Title ta="center">AFTERMATH</Title>
        <Text ta="center" c="dimmed">
          Campus Accountability System
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <Text c="red">{error}</Text>}

        <Button onClick={login} loading={loading}>
          Login
        </Button>

        <Divider label="or sign up" />

        <Button
          variant="light"
          onClick={() => signup("student")}
          loading={loading}
        >
          Signup as Student
        </Button>

        <Button
          variant="outline"
          onClick={() => signup("admin")}
          loading={loading}
        >
          Signup as Admin
        </Button>
      </Stack>
    </Paper>
  )
}
