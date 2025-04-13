import Link from "next/link"
import { Key } from "lucide-react"

export function PublicDocsFooter() {
  return (
    <footer className="w-full border-t bg-white py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/api-docs" className="flex items-center gap-2 font-bold">
              <Key className="h-5 w-5" />
              <span>Authio</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Secure authentication and authorization platform for developers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Documentation</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/api-docs/getting-started" className="hover:underline">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/authentication" className="hover:underline">
                    Authentication
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/endpoints" className="hover:underline">
                    Endpoints
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/sdks" className="hover:underline">
                    SDKs
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Resources</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/api-docs/examples" className="hover:underline">
                    Examples
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/changelog" className="hover:underline">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/support" className="hover:underline">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Company</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:underline">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Authio. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
