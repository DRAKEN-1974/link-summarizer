"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createUser, getUserByEmail, verifyPassword } from "./database"
import { createSession } from "./auth"

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Create new user
    const user = await createUser(email, password)

    // Create session
    const token = createSession(user.id)
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    redirect("/")
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "Failed to create account" }
  }
}

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return { error: "Invalid email or password" }
    }

    // Create session
    const token = createSession(user.id)
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    redirect("/")
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "Failed to sign in" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
  redirect("/auth")
}
