import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { BookOpen, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function AuthPage() {
  const user = await getUser()

  if (user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black flex items-center justify-center p-6 relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8 fade-in">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-black to-gray-600 dark:from-white dark:to-gray-300 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white dark:text-black" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gradient">Link Saver</h1>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Your AI-powered digital library
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <AuthForm />

        {/* Features */}
        <div className="text-center space-y-3 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground">What you'll get:</p>
          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-current" />
              <span>AI-powered link summaries</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-current" />
              <span>Automatic metadata extraction</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-current" />
              <span>Smart search and organization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
