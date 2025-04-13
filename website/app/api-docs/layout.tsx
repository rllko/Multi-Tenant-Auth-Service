import type React from "react"
import type { Metadata } from "next"
import { PublicDocsHeader } from "@/components/public-docs-header"
import { PublicDocsFooter } from "@/components/public-docs-footer"

export const metadata: Metadata = {
  title: {
    template: "%s | Authio API Documentation",
    default: "Authio API Documentation",
  },
  description: "Complete API reference and documentation for the Authio authentication platform",
}

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicDocsHeader />
      <main className="flex-1">{children}</main>
      <PublicDocsFooter />
    </div>
  )
}
