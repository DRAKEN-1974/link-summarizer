import { supabase } from "./supabaseClient"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

export interface User {
  id: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  url: string
  title: string
  summary: string
  favicon_url: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

// User operations
export async function createUser(email: string, password: string): Promise<User> {
  if (!email || !password) {
    throw new Error("Email and password are required")
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }
  const id = randomUUID()
  const password_hash = bcrypt.hashSync(password, 12)
  const { data, error } = await supabase
    .from("users")
    .insert([{ id, email: email.toLowerCase().trim(), password_hash }])
    .select()
    .single()
  if (error) {
    if (error.code === "23505") {
      throw new Error("User with this email already exists")
    }
    throw new Error(error.message)
  }
  return data as User
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) return null
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single()
  if (error) return null
  return data as User
}

export async function getUserById(id: string): Promise<User | null> {
  if (!id) return null
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()
  if (error) return null
  return data as User
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false
  try {
    return bcrypt.compareSync(password, hash)
  } catch (error) {
    return false
  }
}

// Bookmark operations
export async function createBookmark(
  userId: string,
  url: string,
  title: string,
  summary: string,
  faviconUrl: string | null,
  tags: string[] = [],
): Promise<Bookmark> {
  if (!userId || !url || !title) {
    throw new Error("User ID, URL, and title are required")
  }
  const id = randomUUID()
  const { data, error } = await supabase
    .from("bookmarks")
    .insert([
      {
        id,
        user_id: userId,
        url,
        title,
        summary: summary || "",
        favicon_url: faviconUrl,
        tags,
      },
    ])
    .select()
    .single()
  if (error) {
    if (error.code === "23505") {
      throw new Error("This URL is already bookmarked")
    }
    throw new Error(error.message)
  }
  return data as Bookmark
}

export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  if (!userId) return []
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) return []
  return (data as Bookmark[]) || []
}

export async function getBookmarkByUrl(userId: string, url: string): Promise<Bookmark | null> {
  if (!userId || !url) return null
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("url", url)
    .single()
  if (error) return null
  return data as Bookmark
}

export async function deleteBookmarkById(userId: string, id: string): Promise<boolean> {
  if (!userId || !id) return false
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
  return !error
}
