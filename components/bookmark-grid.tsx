"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ExternalLink, Search, Grid, List, Calendar, Globe, Zap, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { deleteBookmark } from "@/lib/bookmark-actions"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"

interface Bookmark {
  id: string
  url: string
  title: string
  summary: string
  favicon_url: string | null
  tags: string[]
  created_at: string
}

interface BookmarkGridProps {
  userId: string
}

export function BookmarkGrid({ userId }: BookmarkGridProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchBookmarks() {
      setLoading(true)
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (!error && data) {
        setBookmarks(data as Bookmark[])
      }
      setLoading(false)
    }
    fetchBookmarks()
  }, [userId])

  // Memoized calculations for performance
  const allTags = useMemo(() => {
    return Array.from(new Set(bookmarks.flatMap((b) => b.tags || [])))
  }, [bookmarks])

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => {
      const matchesSearch =
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTag = !selectedTag || (bookmark.tags || []).includes(selectedTag)
      return matchesSearch && matchesTag
    })
  }, [bookmarks, searchTerm, selectedTag])

  const handleDelete = useCallback(
    async (id: string, title: string) => {
      if (!confirm(`Are you sure you want to delete "${title}"?`)) {
        return
      }

      setIsDeleting(id)
      try {
        await deleteBookmark(id)
        toast({
          title: "Bookmark deleted",
          description: "The bookmark has been removed from your library.",
        })
      } catch (error) {
        console.error("Error deleting bookmark:", error)
        toast({
          title: "Error",
          description: "Failed to delete bookmark. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    },
    [toast],
  )

  const handleExternalLink = useCallback((url: string, title: string) => {
    // Track click analytics could go here
    window.open(url, "_blank", "noopener,noreferrer")
  }, [])

  return (
    <div className="space-y-8">
      {/* Search and Controls */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-ring bg-background/50 backdrop-blur-sm"
              aria-label="Search bookmarks"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="button-smooth focus-ring"
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="button-smooth focus-ring"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>
              {filteredBookmarks.length} of {bookmarks.length} links
            </span>
          </div>
          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>{allTags.length} tags</span>
            </div>
          )}
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filter by tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="button-smooth focus-ring"
              >
                All
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className="button-smooth focus-ring"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks */}
      {loading ? (
        <div className="text-center py-16 fade-in">
          <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Loading your bookmarks...</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We are fetching your bookmarks from the library. Please wait a moment.
          </p>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="text-center py-16 fade-in">
          <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {bookmarks.length === 0 ? "Start Your Digital Library" : "No Results Found"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {bookmarks.length === 0
              ? "Add your first link above to begin building your personalized collection of bookmarks with AI summaries."
              : searchTerm
                ? `No bookmarks match "${searchTerm}". Try different keywords or clear your search.`
                : "No bookmarks match the selected filters. Try selecting different tags."}
          </p>
          {(searchTerm || selectedTag) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedTag(null)
              }}
              className="mt-4 button-smooth focus-ring"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredBookmarks.map((bookmark, index) => (
            <Card
              key={bookmark.id}
              className="card-hover bg-card/50 backdrop-blur-sm border-border/50 fade-in group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className={viewMode === "list" ? "flex gap-6" : "space-y-4"}>
                  {/* Content */}
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 mt-1">
                        {bookmark.favicon_url ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                            <Image
                              src={bookmark.favicon_url || "/placeholder.svg"}
                              alt={`${bookmark.title} favicon`}
                              width={20}
                              height={20}
                              className="w-5 h-5"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {bookmark.title}
                        </h3>
                        <button
                          onClick={() => handleExternalLink(bookmark.url, bookmark.title)}
                          className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors break-all line-clamp-1 text-left focus-ring rounded"
                        >
                          {bookmark.url}
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {bookmark.summary}
                    </p>

                    {/* Tags */}
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {bookmark.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                            onClick={() => setSelectedTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className={
                      viewMode === "list"
                        ? "flex flex-col justify-between items-end gap-3"
                        : "flex justify-between items-center"
                    }
                  >
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={bookmark.created_at}>{new Date(bookmark.created_at).toLocaleDateString()}</time>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExternalLink(bookmark.url, bookmark.title)}
                        className="button-smooth focus-ring h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
                        aria-label={`Open ${bookmark.title} in new tab`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(bookmark.id, bookmark.title)}
                        disabled={isDeleting === bookmark.id}
                        className="button-smooth focus-ring h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-70 group-hover:opacity-100 transition-opacity"
                        aria-label={`Delete ${bookmark.title}`}
                      >
                        <Trash2 className={`h-3 w-3 ${isDeleting === bookmark.id ? "animate-pulse" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
