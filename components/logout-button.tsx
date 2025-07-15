import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-actions"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm" className="button-smooth focus-ring">
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </form>
  )
}
