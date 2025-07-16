"use server"

import { getUser } from "./auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createBookmark, getBookmarkByUrl, deleteBookmarkById } from "./database"

interface BookmarkMetadata {
  title: string
  favicon: string | null
  summary: string
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function fetchBookmarkMetadata(url: string): Promise<BookmarkMetadata> {
  try {
    // Validate URL
    const urlObj = new URL(url)
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs are supported")
    }

    // Fetch the webpage with timeout
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LinkSaver/1.0; +https://linksaver.app)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      },
      8000,
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("text/html")) {
      throw new Error("URL does not point to an HTML page")
    }

    const html = await response.text()

    // Extract title with multiple fallbacks
    let title = urlObj.hostname
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)
    const twitterTitleMatch = html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"[^>]*>/i)

    if (ogTitleMatch?.[1]) {
      title = ogTitleMatch[1].trim()
    } else if (twitterTitleMatch?.[1]) {
      title = twitterTitleMatch[1].trim()
    } else if (titleMatch?.[1]) {
      title = titleMatch[1].trim()
    }

    // Clean up title
    title = title.replace(/\s+/g, " ").trim()
    if (title.length > 200) {
      title = title.substring(0, 200) + "..."
    }

    // Extract favicon with multiple attempts
    let favicon: string | null = null
    const faviconPatterns = [
      /<link[^>]*rel="icon"[^>]*href="([^"]*)"[^>]*>/i,
      /<link[^>]*rel="shortcut icon"[^>]*href="([^"]*)"[^>]*>/i,
      /<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]*)"[^>]*>/i,
    ]

    for (const pattern of faviconPatterns) {
      const match = html.match(pattern)
      if (match?.[1]) {
        const faviconUrl = match[1]
        try {
          favicon = faviconUrl.startsWith("http") ? faviconUrl : new URL(faviconUrl, url).href
          // Test if favicon is accessible
          const faviconResponse = await fetchWithTimeout(favicon, { method: "HEAD" }, 3000)
          if (faviconResponse.ok) {
            break
          }
        } catch {
          favicon = null
        }
      }
    }

    // Try default favicon if none found
    if (!favicon) {
      try {
        const defaultFavicon = new URL("/favicon.ico", url).href
        const faviconResponse = await fetchWithTimeout(defaultFavicon, { method: "HEAD" }, 3000)
        if (faviconResponse.ok) {
          favicon = defaultFavicon
        }
      } catch {
        // Ignore favicon errors
      }
    }

    // Generate summary using Jina AI with better error handling
    let summary = "No summary available"
    try {
      const jinaResponse = await fetchWithTimeout(
        "https://r.jina.ai/" + encodeURIComponent(url),
        {
          headers: {
            Accept: "application/json",
            "X-With-Generated-Alt": "true",
            "X-Retain-Images": "none",
          },
        },
        15000,
      )

      if (jinaResponse.ok) {
        const jinaData = await jinaResponse.json()
        if (jinaData.data?.content) {
          let content = jinaData.data.content.trim()

          // Clean up the content
          content = content.replace(/\n\s*\n/g, "\n").replace(/\s+/g, " ")

          // Extract meaningful summary (first 400 characters)
          if (content.length > 400) {
            const sentences = content.split(/[.!?]+/)
            let summary_text = ""

            for (const sentence of sentences) {
              if ((summary_text + sentence).length > 350) break
              summary_text += sentence + ". "
            }

            summary = summary_text.trim() || content.substring(0, 350) + "..."
          } else {
            summary = content
          }
        }
      }
    } catch (error) {
      console.error("Failed to generate summary with Jina AI:", error)

      // Fallback: extract description from meta tags
      const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
      const ogDescriptionMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)

      if (ogDescriptionMatch?.[1]) {
        summary = ogDescriptionMatch[1].trim()
      } else if (descriptionMatch?.[1]) {
        summary = descriptionMatch[1].trim()
      }

      if (summary.length > 300) {
        summary = summary.substring(0, 300) + "..."
      }
    }

    return {
      title: title || urlObj.hostname,
      favicon,
      summary: summary || "No summary available",
    }
  } catch (error) {
    console.error("Error fetching bookmark metadata:", error)

    // Return basic metadata on error
    try {
      const urlObj = new URL(url)
      return {
        title: urlObj.hostname,
        favicon: null,
        summary: "Unable to generate summary for this link.",
      }
    } catch {
      return {
        title: "Invalid URL",
        favicon: null,
        summary: "Failed to process this link.",
      }
    }
  }
}

export async function addBookmark(prevState: any, formData: FormData) {
  try {
    const user = await getUser()

    if (!user) {
      redirect("/auth")
    }

    const url = formData.get("url") as string

    if (!url?.trim()) {
      return { error: "URL is required", success: false }
    }

    const cleanUrl = url.trim()

    // Validate URL format
    try {
      const urlObj = new URL(cleanUrl)
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return { error: "Please enter a valid HTTP or HTTPS URL", success: false }
      }
    } catch {
      return { error: "Please enter a valid URL", success: false }
    }

    // Check if bookmark already exists
    const existing = await getBookmarkByUrl(user.id, cleanUrl)
    if (existing) {
      return { error: "This URL is already in your library", success: false }
    }

    // Fetch metadata
    const metadata = await fetchBookmarkMetadata(cleanUrl)

    // Save bookmark
    await createBookmark(user.id, cleanUrl, metadata.title, metadata.summary, metadata.favicon)

    revalidatePath("/")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error adding bookmark:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to save bookmark. Please try again.",
      success: false,
    }
  }
}

export async function deleteBookmark(id: string) {
  try {
    const user = await getUser()

    if (!user) {
      redirect("/auth")
    }

    if (!id?.trim()) {
      throw new Error("Bookmark ID is required")
    }

    const success = await deleteBookmarkById(user.id, id)

    if (!success) {
      throw new Error("Bookmark not found or could not be deleted")
    }

    revalidatePath("/")
  } catch (error) {
    console.error("Error deleting bookmark:", error)
    throw error
  }
}
