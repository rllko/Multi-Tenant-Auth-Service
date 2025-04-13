"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Shield, User, Mail } from "lucide-react"

export default function ConsentScreen() {
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for the consent screen
  const application = {
    name: "Web Dashboard",
    clientId: "client_1a2b3c4d5e6f7g8h9i",
    logoUrl: "/placeholder.svg?height=64&width=64",
  }

  const requestedScopes = [
    { id: "profile", name: "profile", description: "View your basic profile information" },
    { id: "email", name: "email", description: "View your email address" },
    { id: "api:read", name: "api:read", description: "Read your data" },
  ]

  const handleAllow = async () => {
    setIsLoading(true)

    // Simulate authorization
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // In a real app, this would redirect to the redirect_uri with the authorization code
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Authorization failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeny = () => {
    // In a real app, this would redirect to the redirect_uri with an error
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-4">
            <img
              src={application.logoUrl || "/placeholder.svg"}
              alt={application.name}
              className="h-12 w-12 rounded-md border p-1"
            />
            <div>
              <CardTitle className="text-xl">{application.name} wants to access your account</CardTitle>
              <CardDescription>Authorize this application to use your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium mb-2">This application will be able to:</p>
            <ul className="space-y-3">
              {requestedScopes.map((scope) => (
                <li key={scope.id} className="flex items-start gap-3">
                  {scope.name === "profile" && <User className="h-5 w-5 text-blue-500 mt-0.5" />}
                  {scope.name === "email" && <Mail className="h-5 w-5 text-blue-500 mt-0.5" />}
                  {scope.name === "api:read" && <Shield className="h-5 w-5 text-blue-500 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium">{scope.description}</p>
                    <p className="text-xs text-muted-foreground">Scope: {scope.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm font-normal">
              Don't ask again for this application
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={handleDeny} disabled={isLoading}>
            Deny
          </Button>
          <Button onClick={handleAllow} disabled={isLoading}>
            {isLoading ? "Authorizing..." : "Allow"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
