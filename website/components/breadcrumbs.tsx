"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
  const pathname = usePathname()

  // Skip the /dashboard part
  const paths = pathname.split("/").filter((path) => path && path !== "dashboard")

  if (paths.length === 0) {
    return (
      <div className="flex items-center">
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="ml-2 text-sm font-medium">Dashboard</span>
      </div>
    )
  }

  return (
    <nav className="flex items-center text-sm">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center">
        <Home className="h-4 w-4" />
      </Link>

      {paths.map((path, index) => {
        // Build the href for this breadcrumb
        const href = `/dashboard/${paths.slice(0, index + 1).join("/")}`

        // Format the path for display
        const displayPath = path
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        const isLast = index === paths.length - 1

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium">{displayPath}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground">
                {displayPath}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
