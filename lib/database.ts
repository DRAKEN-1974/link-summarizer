import Database from "better-sqlite3"
import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"
import path from "path"
import fs from "fs"

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, "app.db")
let db: Database.Database

try {
  db = new Database(dbPath)
  db.pragma("journal_mode = WAL")
  db.pragma("synchronous = NORMAL")
  db.pragma("cache_size = 1000")
  db.pragma("foreign_keys = ON")
} catch (error) {
  console.error("Failed to initialize database:", error)
  throw new Error("Database initialization failed")
}

// Initialize database tables with better schema
const initDb = () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT,
        favicon_url TEXT,
        tags TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, url)
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url);

      -- Triggers for updated_at
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
        AFTER UPDATE ON users
        BEGIN
          UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

      CREATE TRIGGER IF NOT EXISTS update_bookmarks_timestamp 
        AFTER UPDATE ON bookmarks
        BEGIN
          UPDATE bookmarks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
    `)
  } catch (error) {
    console.error("Failed to initialize database schema:", error)
    throw error
  }
}

initDb()

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

// User operations with better error handling
export function createUser(email: string, password: string): User {
  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  const id = randomUUID()
  const password_hash = bcrypt.hashSync(password, 12) // Increased rounds for better security

  try {
    const stmt = db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)")
    stmt.run(id, email.toLowerCase().trim(), password_hash)

    return {
      id,
      email: email.toLowerCase().trim(),
      password_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new Error("User with this email already exists")
    }
    throw new Error("Failed to create user")
  }
}

export function getUserByEmail(email: string): User | null {
  if (!email) return null

  try {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?")
    return stmt.get(email.toLowerCase().trim()) as User | null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

export function getUserById(id: string): User | null {
  if (!id) return null

  try {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?")
    return stmt.get(id) as User | null
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false

  try {
    return bcrypt.compareSync(password, hash)
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

// Bookmark operations with better error handling
export function createBookmark(
  userId: string,
  url: string,
  title: string,
  summary: string,
  faviconUrl: string | null,
  tags: string[] = [],
): Bookmark {
  if (!userId || !url || !title) {
    throw new Error("User ID, URL, and title are required")
  }

  const id = randomUUID()
  const tagsJson = JSON.stringify(tags)

  try {
    const stmt = db.prepare(`
      INSERT INTO bookmarks (id, user_id, url, title, summary, favicon_url, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, userId, url, title, summary || "", faviconUrl, tagsJson)

    return {
      id,
      user_id: userId,
      url,
      title,
      summary: summary || "",
      favicon_url: faviconUrl,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new Error("This URL is already bookmarked")
    }
    throw new Error("Failed to create bookmark")
  }
}

export function getBookmarks(userId: string): Bookmark[] {
  if (!userId) return []

  try {
    const stmt = db.prepare("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC")
    const rows = stmt.all(userId) as any[]

    return rows.map((row) => ({
      ...row,
      tags: JSON.parse(row.tags || "[]"),
    }))
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return []
  }
}

export function getBookmarkByUrl(userId: string, url: string): Bookmark | null {
  if (!userId || !url) return null

  try {
    const stmt = db.prepare("SELECT * FROM bookmarks WHERE user_id = ? AND url = ?")
    const row = stmt.get(userId, url) as any

    if (!row) return null

    return {
      ...row,
      tags: JSON.parse(row.tags || "[]"),
    }
  } catch (error) {
    console.error("Error fetching bookmark by URL:", error)
    return null
  }
}

export function deleteBookmarkById(userId: string, id: string): boolean {
  if (!userId || !id) return false

  try {
    const stmt = db.prepare("DELETE FROM bookmarks WHERE id = ? AND user_id = ?")
    const result = stmt.run(id, userId)
    return result.changes > 0
  } catch (error) {
    console.error("Error deleting bookmark:", error)
    return false
  }
}

export function getBookmarkStats(userId: string): { total: number; thisMonth: number } {
  if (!userId) return { total: 0, thisMonth: 0 }

  try {
    const totalStmt = db.prepare("SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?")
    const total = (totalStmt.get(userId) as any)?.count || 0

    const monthStmt = db.prepare(`
      SELECT COUNT(*) as count FROM bookmarks 
      WHERE user_id = ? AND created_at >= date('now', 'start of month')
    `)
    const thisMonth = (monthStmt.get(userId) as any)?.count || 0

    return { total, thisMonth }
  } catch (error) {
    console.error("Error fetching bookmark stats:", error)
    return { total: 0, thisMonth: 0 }
  }
}

// Graceful shutdown
process.on("exit", () => {
  if (db) {
    db.close()
  }
})

process.on("SIGINT", () => {
  if (db) {
    db.close()
  }
  process.exit(0)
})
