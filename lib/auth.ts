import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getUserById } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production-please"

if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET environment variable is not set. Using fallback secret.")
}

export interface SessionUser {
  id: string
  email: string
}

export async function getUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; exp: number }

    // Check if token is expired (additional check)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    const user = getUserById(payload.userId)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error("Error verifying user session:", error)
    return null
  }
}

export function createSession(userId: string): string {
  if (!userId) {
    throw new Error("User ID is required to create session")
  }

  return jwt.sign(
    {
      userId,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "link-saver",
      audience: "link-saver-users",
    },
  )
}

export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
  } catch (error) {
    console.error("Error clearing session:", error)
  }
}
