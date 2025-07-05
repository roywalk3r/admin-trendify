import { redis } from "./redis"
import { z } from "zod"
import crypto from "crypto"

// Define session schema
const SessionSchema = z.object({
  userId: z.string(),
  data: z.record(z.unknown()),
  createdAt: z.number(),
  expiresAt: z.number(),
})

export type Session = z.infer<typeof SessionSchema>

// Session duration in seconds (default: 24 hours)
const DEFAULT_SESSION_DURATION = 60 * 60 * 24

// Create a new session
export async function createSession(
  userId: string,
  data: Record<string, unknown> = {},
  duration: number = DEFAULT_SESSION_DURATION,
): Promise<string> {
  // Generate a secure random session ID
  const sessionId = crypto.randomBytes(32).toString("hex")

  const now = Date.now()

  const session: Session = {
    userId,
    data,
    createdAt: now,
    expiresAt: now + duration * 1000,
  }

  // Store session in Redis with expiration
  await redis.set(`session:${sessionId}`, session, { ex: duration })

  return sessionId
}

// Get session by ID
export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const session = await redis.get<Session>(`session:${sessionId}`)

    if (!session) {
      return null
    }

    // Validate session data
    return SessionSchema.parse(session)
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Update session data
export async function updateSession(sessionId: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const session = await getSession(sessionId)

    if (!session) {
      return false
    }

    // Update session data
    const updatedSession: Session = {
      ...session,
      data: {
        ...session.data,
        ...data,
      },
    }

    // Calculate remaining time until expiration
    const remainingTime = Math.floor((updatedSession.expiresAt - Date.now()) / 1000)

    if (remainingTime <= 0) {
      return false
    }

    // Store updated session with the same expiration
    await redis.set(`session:${sessionId}`, updatedSession, { ex: remainingTime })

    return true
  } catch (error) {
    console.error("Error updating session:", error)
    return false
  }
}

// Delete session
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await redis.del(`session:${sessionId}`)
    return true
  } catch (error) {
    console.error("Error deleting session:", error)
    return false
  }
}

// Extend session duration
export async function extendSession(sessionId: string, duration: number = DEFAULT_SESSION_DURATION): Promise<boolean> {
  try {
    const session = await getSession(sessionId)

    if (!session) {
      return false
    }

    // Update expiration time
    const updatedSession: Session = {
      ...session,
      expiresAt: Date.now() + duration * 1000,
    }

    // Store updated session with new expiration
    await redis.set(`session:${sessionId}`, updatedSession, { ex: duration })

    return true
  } catch (error) {
    console.error("Error extending session:", error)
    return false
  }
}
