import Link from "next/link"

export function PublicDocsFooter() {
  return (
    <footer className="w-full border-t border-border bg-background py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/api-docs" className="flex items-center gap-2 font-bold">
              <div className="h-6 w-6 rounded-md bg-keyauth-blue flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-white"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M10 12h4" />
                  <path d="M10 16h4" />
                  <path d="M10 8h1" />
                </svg>
              </div>
              <span className="text-foreground">KeyAuth</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Secure authentication and authorization platform for developers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-foreground">Documentation</h3>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link href="/api-docs/getting-started" className="text-muted-foreground hover:text-foreground">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/authentication" className="text-muted-foreground hover:text-foreground">
                    Authentication
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/endpoints" className="text-muted-foreground hover:text-foreground">
                    Endpoints
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/models" className="text-muted-foreground hover:text-foreground">
                    Data Models
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/sdks" className="text-muted-foreground hover:text-foreground">
                    SDKs
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-foreground">Resources</h3>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link href="/api-docs/examples" className="text-muted-foreground hover:text-foreground">
                    Examples
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/changelog" className="text-muted-foreground hover:text-foreground">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/faq" className="text-muted-foreground hover:text-foreground">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs/support" className="text-muted-foreground hover:text-foreground">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-foreground">Company</h3>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} KeyAuth. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
