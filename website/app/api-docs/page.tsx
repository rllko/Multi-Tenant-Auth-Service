import { PublicApiDocumentation } from "@/components/public-api-documentation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authio API Documentation",
  description: "Complete API reference and documentation for the Authio authentication platform",
}

export default function ApiDocsPage() {
  return <PublicApiDocumentation />
}
