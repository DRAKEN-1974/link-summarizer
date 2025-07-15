"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { addBookmark } from "@/lib/bookmark-actions"
import { useActionState } from "react"
import { Plus, Loader2, Link, Sparkles } from "lucide-react"

export function AddBookmarkForm() {
  const [state, action, isPending] = useActionState(addBookmark, { error: null, success: false })

  return (
    <Card className="gradient-border card-hover bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Link className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold">Add New Bookmark</h2>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </div>

          <form action={action} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                name="url"
                type="url"
                placeholder="Paste any URL to save and summarize with AI..."
                required
                className="h-12 text-base focus-ring border-2 transition-all duration-200 bg-background/50"
                disabled={isPending}
              />
              {isPending && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 px-6 button-smooth focus-ring bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Save Link
                </>
              )}
            </Button>
          </form>

          {state?.error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm fade-in">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm fade-in">
              ✨ Bookmark saved successfully with AI summary!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
