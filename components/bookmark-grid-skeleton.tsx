import { Card, CardContent } from "@/components/ui/card"

export function BookmarkGridSkeleton() {
  return (
    <div className="space-y-8">
      {/* Search skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-muted/50 rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-4 bg-muted/50 rounded w-32 animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-muted/50 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted/50 rounded animate-pulse" />
                  <div className="h-3 bg-muted/50 rounded w-3/4 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted/50 rounded animate-pulse" />
                <div className="h-3 bg-muted/50 rounded animate-pulse" />
                <div className="h-3 bg-muted/50 rounded w-2/3 animate-pulse" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-muted/50 rounded w-20 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 w-6 bg-muted/50 rounded animate-pulse" />
                  <div className="h-6 w-6 bg-muted/50 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
