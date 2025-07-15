import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BookmarkGrid } from "@/components/bookmark-grid"
import { AddBookmarkForm } from "@/components/add-bookmark-form"
import { Header } from "@/components/header"
import { getBookmarks } from "@/lib/database"
import { Suspense } from "react"
import { BookmarkGridSkeleton } from "@/components/bookmark-grid-skeleton"

export default async function HomePage() {
  const user = await getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <section className="text-center space-y-6 fade-in" aria-labelledby="hero-title">
            <div className="space-y-4">
              <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient">
                Your Digital Library
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Save, organize, and discover your favorite links with AI-powered summaries that help you remember why
                each link matters.
              </p>
            </div>
          </section>

          {/* Add Bookmark Form */}
          <section className="slide-up" aria-labelledby="add-bookmark-title">
            <AddBookmarkForm />
          </section>

          {/* Bookmarks Grid */}
          <section className="slide-up" style={{ animationDelay: "0.1s" }} aria-labelledby="bookmarks-title">
            <Suspense fallback={<BookmarkGridSkeleton />}>
              <BookmarkGridWrapper userId={user.id} />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  )
}

async function BookmarkGridWrapper({ userId }: { userId: string }) {
  const bookmarks = await getBookmarks(userId)
  return <BookmarkGrid bookmarks={bookmarks} />
}
