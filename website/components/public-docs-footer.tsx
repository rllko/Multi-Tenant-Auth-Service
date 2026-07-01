import Link from "next/link"
import {KeyRound} from "lucide-react"

export function PublicDocsFooter() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <KeyRound className="h-4 w-4"/>
                        <span>Authio — Multi-Tenant Authentication Service</span>
                    </div>

                    <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Link href="/api-docs" className="hover:text-foreground transition-colors">
                            API Reference
                        </Link>
                        <Link href="/api-docs/getting-started" className="hover:text-foreground transition-colors">
                            Getting Started
                        </Link>
                        <Link href="/api-docs/models" className="hover:text-foreground transition-colors">
                            Models
                        </Link>
                        <Link href="/login" className="hover:text-foreground transition-colors">
                            Dashboard
                        </Link>
                    </nav>
                </div>

                <p className="mt-6 text-center md:text-left text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Authio. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
