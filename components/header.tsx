import { BookOpen } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  user: {
    id: string
    email: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-effect border-b backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-black to-gray-600 dark:from-white dark:to-gray-300">
              <BookOpen className="h-6 w-6 text-white dark:text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">Link Saver</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
