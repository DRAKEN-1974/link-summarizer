"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signUp, signIn } from "@/lib/auth-actions"
import { useActionState } from "react"
import { Mail, Lock, Loader2 } from "lucide-react"

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpState, signUpAction, isSignUpPending] = useActionState(signUp, { error: "" })
  const [signInState, signInAction, isSignInPending] = useActionState(signIn, { error: "" })

  const currentState = isSignUp ? signUpState : signInState
  const currentAction = isSignUp ? signUpAction : signInAction
  const isPending = isSignUp ? isSignUpPending : isSignInPending

  return (
    <Card className="gradient-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isSignUp ? "Start building your digital library" : "Sign in to your library"}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={currentAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="focus-ring bg-background/50"
              placeholder="Enter your email"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="focus-ring bg-background/50"
              placeholder="Enter your password"
              disabled={isPending}
            />
          </div>

          {currentState?.error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm fade-in">
              {currentState.error}
            </div>
          )}

          <Button type="submit" className="w-full button-smooth focus-ring" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors focus-ring rounded px-1"
            disabled={isPending}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
